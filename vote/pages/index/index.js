//detail.js
var util = require('../../utils/util.js');
Page({
  data: {
    userInfo: {},
    voteDetail:'',
    isVote:'',
    items: [
      {name: 'USA', value: '美国'},
      {name: 'CHN', value: '中国', checked: 'true'},
      {name: 'BRA', value: '巴西'},
      {name: 'JPN', value: '日本'},
      {name: 'ENG', value: '英国'},
      {name: 'TUR', value: '法国'},
    ],
    radioOption:[],
    checkOption:[],
    id:''
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '投票活动',
      path: '/pages/index/index?id=' + this.data.id,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  onLoad: function(option){
    this.data.id = option.id;
  },
  onShow: function () {
    var that = this;
    if (wx.getStorageSync('userInfo')) {
      that.setData({
        userInfo:JSON.parse(wx.getStorageSync('userInfo'))
      })
    }
    util.request({
      type:1,
      method: 'GET',
      url: '/vote/result?id=' + that.data.id
    }).then(function (res) {
      if (res.status == 401) {
        wx.login({
          success: function(data) {
            if(data.code) {
              wx.getUserInfo({
                withCredentials: true,
                success: function(res) {
                  that.setData({
                    userInfo:res.userInfo
                  })
                  wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
                  util.request({
                    method: 'POST',
                    url: '/applet/auth',
                    data: {
                      code: data.code,
                      signature: res.signature,
                      iv: res.iv,
                      dncryptedData: res.encryptedData
                    }
                  }).then(function(res) {
                    wx.setStorageSync('___sessionid', res.sessionid);
                    if(!that.data.id){
                      return;
                    }
                    util.request({
                      method: 'GET',
                      url: '/vote/result?id=' + that.data.id
                    }).then(function (res) {
                      let sum = 0;
                      res.Option.forEach(function(item){
                        sum += item.NumOfVotes;
                      })
                      res.sum = sum;
                      that.setData({
                        voteDetail:res
                      })
                      if (res.Type == 1) {
                        that.data.radioOption = [{id:res.Option[0].Id}]
                      }
                    });
                  });
                },
                fail: function(res) {
                   wx.openSetting({
                    success: (res) => {
                      if(res.authSetting['scope.userInfo']) {
                        wx.showModal({
                          showCancel: false,
                          content: '您点击了拒绝授权，请重新进入或等待加载。'
                        });
                      } else {
                        wx.showModal({
                          showCancel: false,
                          content: '您点击了拒绝授权，请授权使用。'
                        });
                      }
                    }
                  }) 
                }
              })
            } else {
              wx.showModal({
                showCancel: false,
                content: '获取用户登录态失败！请删除小程序后重新进入。'
              });
            }

          }
        })
      } else {
        let sum = 0;
        res.Option.forEach(function(item){
          sum += item.NumOfVotes;
        })
        res.sum = sum;
        that.setData({
          voteDetail:res
        })
        if (res.Type == 1) {
          that.data.radioOption = [{id:res.Option[0].Id}]
        }
      }
    });
   /*  wx.checkSession({
      success: function(){
        //session 未过期，并且在本生命周期一直有效
        that.setData({
          userInfo:JSON.parse(wx.getStorageSync('userInfo'))
        })
        util.request({
          method: 'GET',
          url: '/vote/result?id=' + option.id
        }).then(function (res) {
          let sum = 0;
          res.Option.forEach(function(item){
            sum += item.NumOfVotes;
          })
          res.sum = sum;
          that.setData({
            voteDetail:res
          })
          if (res.Type == 1) {
            that.data.radioOption = [{id:res.Option[0].Id}]
          }
        });
      },
      fail: function(){
        //登录态过期
        wx.login({
          success: function(data) {
            if(data.code) {
              wx.getUserInfo({
                withCredentials: true,
                success: function(res) {
                  that.setData({
                    userInfo:res.userInfo
                  })
                  wx.setStorageSync('userInfo', JSON.stringify(res.userInfo));
                  util.request({
                    method: 'POST',
                    url: '/applet/auth',
                    data: {
                      code: data.code,
                      signature: res.signature,
                      iv: res.iv,
                      dncryptedData: res.encryptedData
                    }
                  }).then(function(res) {
                    wx.setStorageSync('___sessionid', res.sessionid);
                    if(!option.id){
                      return;
                    }
                    util.request({
                      method: 'GET',
                      url: '/vote/result?id=' + option.id
                    }).then(function (res) {
                      let sum = 0;
                      res.Option.forEach(function(item){
                        sum += item.NumOfVotes;
                      })
                      res.sum = sum;
                      that.setData({
                        voteDetail:res
                      })
                      if (res.Type == 1) {
                        that.data.radioOption = [{id:res.Option[0].Id}]
                      }
                    });
                  });
                },
                fail: function(res) {
                  wx.openSetting({
                    success: (res) => {
                      if(res.authSetting['scope.userInfo']) {
                        wx.showModal({
                          showCancel: false,
                          content: '您点击了拒绝授权，请重新扫码后进入。'
                        });
                      } else {
                        wx.showModal({
                          showCancel: false,
                          content: '您点击了拒绝授权，请删除小程序后重新进入。'
                        });
                      }
                    }
                  })
                }
              })
            } else {
              wx.showModal({
                showCancel: false,
                content: '获取用户登录态失败！请删除小程序后重新进入。'
              });
            }

          }
        })
      }
    }) */
    
  },
  radioChange: function (e) {
    let option = [{id:e.detail.value}];
    this.data.radioOption = option;
  },
  checkboxChange: function (e) {
    let that = this
    this.data.checkOption = [];
    e.detail.value.forEach(function(item) {
      let optionItem = {id:item};
      that.data.checkOption.push(optionItem)
    });
  },
  addVote: function(){
		wx.navigateTo({
			url: '../createVote/createVote'
		})
	},
  createVote: function(){
    let that = this;
    let params = {
      id:this.data.voteDetail.Id,
      option:''
    }
    if (this.data.voteDetail.Type == 1) {
      params.option = this.data.radioOption
    } else{
      if (!this.data.checkOption.length) {
        wx.showModal({
          showCancel: false,
          content: '请至少选择一项'
        });
        return;
      }
      params.option = this.data.checkOption
    }
    util.request({
      method: 'POST',
      url: '/vote/submit',
      data: params
    }).then(function (res) {
      wx.showModal({
        showCancel: false,
        content: '投票成功'
      });
      setTimeout(function(){
        util.request({
          method: 'GET',
          url: '/vote/result?id=' + that.data.id
        }).then(function (res) {
          let sum = 0;
          res.Option.forEach(function(item){
            sum += item.NumOfVotes;
          })
          res.sum = sum;
          that.setData({
            voteDetail:res
          })
          if (res.Type == 1) {
            that.data.radioOption = [{id:res.Option[0].Id}]
          }
        });
      },1500)
    });
  }
})
