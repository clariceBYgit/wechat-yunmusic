import request from '../../../utils/request'
Page({
    data: {
        userInfo:{
            name:'可可',
            age:20
        }
    },
    // 获取用户的唯一标识openId的回调
    handleGetOpenId(){
        // 1.获取登录凭证
        wx.login({
          success:async (res) => {
            let code = res.code
            //将用户凭证发送发到服务器；
            let result = await request('/getOpenId',{code});
            console.log(result)

          }
        })
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