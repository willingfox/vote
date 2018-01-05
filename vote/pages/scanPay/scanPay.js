//scanPay.js
var util = require('../../utils/util.js');
var shop_id = '';
var order_id = '';
var isPay = false;
Page({
	data: {
		mer_logo: '',
		inputValue: '',
		inputStyle: '',
		disabled: true
	},
	onLoad: function(option) {
		var that = this;
		isPay = false;
		shop_id = option.shop_id;
		wx.login({
			success: function(data) {
				if(data.code) {
					wx.getUserInfo({
						withCredentials: true,
						success: function(res) {
							util.request({
								method: 'POST',
								url: '/applet/auth',
								data: {
									code: data.code,
									signature: res.signature,
									iv: res.iv,
									dncryptedData: res.encryptedData,
									shop_id: shop_id
								}
							}).then(function(res) {
								wx.setStorageSync('___sessionid', res.sessionid);
								util.request({
									method: 'GET',
									url: '/shop/' + shop_id
								}).then(function(res) {
									that.setData({
										mer_logo: res.shopLogo
									});
									wx.setNavigationBarTitle({
										title: res.shopName
									});
								});
							});
						},
						fail: function(res) {
							wx.openSetting({
								success: (res) => {
									if(res.authSetting['scope.userInfo']) {
										wx.showModal({
											showCancel: false,
											content: '您点击了拒绝授权，将无法正常使用收银功能。请重新扫码后进入。'
										});
									} else {
										wx.showModal({
											showCancel: false,
											content: '您点击了拒绝授权，将无法正常使用收银功能。请删除小程序后重新进入。'
										});
									}
								}
							})
						}
					})
				} else {
					wx.showModal({
						showCancel: false,
						content: '获取用户登录态失败！您将无法正常使用收银功能。请删除小程序后重新进入。'
					});
				}

			}
		})

	},
	bindKeyInput: function(e) {
		if(e.detail.value) {
			this.setData({
				inputValue: e.detail.value * 100,
				inputStyle: '#e8434e',
				disabled: false
			});
		} else {
			this.setData({
				inputValue: e.detail.value * 100,
				inputStyle: '',
				disabled: true
			});
		}
	},
	toPay: function() {
		var that = this;
		if(isPay) return;
		isPay = true;
		if(that.data.inputValue <= 0) return;
		util.request({
			type: 1,
			method: 'POST',
			url: '/order/create-scan',
			data: {
				shop_id: shop_id,
				total_price: that.data.inputValue,
				user_mark: 'applet'
			}
		}).then(function(res) {
			order_id = res.id;
			util.request({
				type: 1,
				method: 'GET',
				url: '/api/pay/get-prepay-info?order_id=' + order_id + '&pay_type=1&is_minipg=1',
			}).then(function(res) {
				wx.requestPayment({
					timeStamp: res.timeStamp,
					nonceStr: res.nonceStr,
					package: res.package,
					signType: res.signType,
					paySign: res.paySign,
					success: function(res) {
						isPay = false;
						wx.navigateTo({
							url: '../detail/detail?shop_id=' + shop_id + '&order_id=' + order_id
						})
					},
					fail: function(res) {
						isPay = false;
						wx.showModal({
							showCancel: false,
							content: res.message
						});
					}
				})
			}, function(res) {
				isPay = false;
				wx.showModal({
					showCancel: false,
					content: res.message
				});
			});
		}, function(res) {
			isPay = false;
			wx.showModal({
				showCancel: false,
				content: res.message
			});
		});
	}
})