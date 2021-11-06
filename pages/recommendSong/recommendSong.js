// pages/recommendSong/recommedSong.js
import requset from '../../utils//request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        day:'',//天
        month:'',//月
        recommendList:[] //推荐列表
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 判断用户是否登录
        let userInfo = wx.getStorageSync('userInfo');
        if(!userInfo){
            wx.showToast({
                title:"请先登录",
                icon:"none",
                success:()=>{
                    // 跳转至登录页面
                    wx.reLauch({
                        url:'/pages/login/login'
                    })
                }
            })
        }
        // 自动获取日期
        this.setData({
            day:new Date().getDate(),
            month:new Date().getMonth() + 1
        })
        // 获取用户每日推荐

        this.getRecommendList()
        
    },
        // 获取用户每日推荐
    async getRecommendList(){
        let recommendListData = await requset('/recommend/songs');
        this.setData({
            recommendList:recommendListData.recommend
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})