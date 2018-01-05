//detail.js
var util = require('../../utils/util.js');
Page({
  data: {
    option:[
      {
        content:''
      },
      {
        content:''
      }
    ],
    name:'',
    type:1
  },
  addOption:function() {
    let len = this.data.option.length;
    let item = {
      content:''
    }
    let option = this.data.option.push(item)
    this.setData({
      option:this.data.option
    })
  },
  subOption:function(e) {
    let index = e.currentTarget.dataset.index;
    this.data.option.splice(index,1)
    this.setData({
      option:this.data.option
    })
  },
  bindNameInput:function(e){
    this.setData({
      name: e.detail.value
    });
  },
  bindOptionInput:function(e){
    let index = e.currentTarget.dataset.index;
    this.data.option[index].content = e.detail.value
    this.setData({
      option: this.data.option
    });
  },
  radioChange:function(e){
    this.setData({
      type: e.detail.value
    });
  },
  save: function () {
    //请求参数
    let params = {
      name:this.data.name,
      type:Number(this.data.type),
      option:JSON.parse(JSON.stringify(this.data.option))
    }
    //校验及去除没有填的选项
    if(!params.name.trim()) {
      wx.showModal({
        showCancel: false,
        content: '投票主题不能为空'
      });
      return;
    }
    let flag = true;
    params.option.forEach(function(item,index) {
      if(!item.content.trim() && index < 2){
        flag = false;
        wx.showModal({
          showCancel: false,
          content: '请输入投票选项'
        });
        return
      } else if (!item.content.trim() && index >= 2) {
        params.option[index] = ''
      }
    });
    if (!flag) {
      return;
    }
    let arr = [];
    params.option.forEach(function(item){
      if (item) {
        arr.push(item);
      }
    })
    params.option = arr;
    //提交
    util.request({
      method: 'POST',
      url: '/vote/create',
      data:params
    }).then(function(res) {
      wx.navigateTo({
        url: '../index/index?id=' + res.Id + '&isVote=2'
      })
    });
    
  },
  reset: function () {
    this.data.name = '';
    this.data.type = '1';
    this.data.option = [
      {
        content:''
      },
      {
        content:''
      }
    ]
    this.setData({
      option:this.data.option,
      type:this.data.type,
      name:this.data.name
    })
  },
  onLoad: function () {
    
  }
})
