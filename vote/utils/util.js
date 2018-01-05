function formatTime(date) {
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()

	var hour = date.getHours()
	var minute = date.getMinutes()
	var second = date.getSeconds()

	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function timeClean(val) {
	if (val) {
		var index = val.indexOf('.');
		return val.substring(0, index);
	}
}

function request(option) {
	var sessionId = wx.getStorageSync('___sessionid');
	var path = 'https://gapp.mopt.snsshop.net';
	if (sessionId && sessionId != undefined) {
		option.header = {
			'Content-Type': 'application/json',
			'Cookie': '___sessionid=' + sessionId
		}
	} else {
		option.header = {
			'Content-Type': 'application/json'
		}
	}
	return new Promise(function (resolve, reject) {
		wx.request({
			method: option.method,
			url: path + option.url,
			data: option.data,
			header: option.header,
			success: function (res) {
				if (res.statusCode == 200) {
					resolve(res.data)
				} else if (res.statusCode == 401) {
					if (option.type == 1) {
						resolve(res.data)
					} else {
						wx.showModal({
							showCancel: false,
							content: '登录超时，请重新登录'
						});
					}
				}
			},
			fail: function (res) {
				if (option.type == 1) {//执行失败回调
					reject(res.data);
				} else {
					wx.showModal({
						showCancel: false,
						content: res.data.message
					});
				}
			}
		})
	})
}
module.exports = {
	formatTime: formatTime,
	formatNumber: formatNumber,
	timeClean:timeClean,
	request: request
}