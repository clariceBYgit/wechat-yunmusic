// pages/video/video.js
import requset from '../../utils/request';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoGroupList: [], //视频导航栏数组
        navId:"" , //导航的标识
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // 获取导航栏数据
        this.getVideoGroupList();
       
    },

    // 获取导航数据
    async getVideoGroupList() {
        let videoGroupListData = await requset('/video/group/list');
        this.setData({
            videoGroupList: videoGroupListData.data.slice(0, 14),
            navId : videoGroupListData.data[0].id

        })
         // 获取视频列表数据
         this.getVideoList(this.data.navId);
    },
    // 获取视频列表数据
    async getVideoList(navId){
        let videoListData = await requset('/video/group',{id:navId})
        console.log(videoListData)
    },
    // 点击切换导航的回调
    navChange(event){
        // let navId = event.currentTarget.id; //通过id传参的时候如果传的是number 会自动转换成string
        // this.setData({navId:navId*1})
        let navId = event.currentTarget.dataset.id
        this.setData({navId:navId})

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