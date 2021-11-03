// pages/login/login.jsxiangg
/*
说明：登录流程
1.收集表单数据
2.前端验证
    1)验证用户信息（账号 密码） 是否合法
    2）前端验证不通过就提示用户，不需要发送请求给后端
    3）前端验证通过，发送请求（携带账号 密码） 给服务器
3.后端验证
    1）验证用户是否存在
    2）用户不存在 直接返回 告诉前端用户不存在
    3）用户存在 需要验证密码是否正确
    4) 密码不正确返回给前端提示密码错误
    5）密码正确返回前端数据 提示用户登录成功（会携带用户的相关信息） 


*/

import request from "../../utils/request"



Page({

    /**
     * 页面的初始数据
     */
    data: {
        phone: '',
        password: '',
        userInfo:{}

    },

    /**
     * 生命周期函数--监听页面加载
     */
    // 表单项内容发生改变的回调
    handleInput(event) {
        // let type = event.currentTarget.id; //id 传值 取值：phone || password
        let type = event.currentTarget.dataset.type; //data-key=value
        this.setData({
            [type]: event.detail.value
        })
        // console.log(this.data)
    },
    // 登录的回调
    async login() {
        let { phone, password } = this.data;

        /**
         * 
         * 2.前端验证
         *      手机号验证
         *      1.内容为空
         *      2.手机号格式不正确
         *      3.手机号格式正确，验证通过
         * 
         * 
         */
        let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
        if (!phone) {
            wx.showToast({
                title: "手机号不能为空",
                icon: "none"
            })
            return;
        }
        if (!phoneReg.test(phone)) {
            wx.showToast({
                title: "手机号格式错误",
                icon: "none"
            })
            return;
        }

        if (!password) {
            wx.showToast({
                title: "密码不能为空",
                icon: "none"
            })
            return;
        }
        // 后端验证
        let result = await request("/login/cellphone", { phone, password ,isLogin:true})
        if (result.code === 200) { //登录成功 
            wx.showToast({
                title: "登录成功",
                icon: "none"
            })
          
            // 将用户的信息存储至本地
            wx.setStorageSync("userInfo",JSON.stringify(result.profile))
            this.setData({
                userInfo:JSON.toString(this.userInfo)
            })
            // 跳转至 个人中心 personal
            wx.reLaunch({
              url: '/pages/personal/personal',
            })
        } else if (result.code === 400) {
            wx.showToast({
                title: "手机号错误",
                icon: "none"

            })
        } else if (result.code === 502) {
            wx.showToast({
                title: "密码错误",
                icon: "none"
            })
        } else {
            wx.showToast({
                title: "登录失败,请重新登录",
                icon: "none"
            })
        }

    },
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})