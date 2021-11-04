// pages/video/video.js
import requset from '../../utils/request';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoGroupList: [], //视频导航栏数组
        navId:"" , //导航的标识
        videoList :[],//视频动态列表数据
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
        let videoListData = await requset('/video/group',{id:navId});
        // 关闭加载完的提示框

        wx.hideLoading();

        let index = 0
        let videoList = videoListData.datas.map(item=>{
            item.id=index++;
            return item;
        })
        this.setData({
            videoList
        })
        console.log(videoList)
    },
    // 点击切换导航的回调
    navChange(event){
        // let navId = event.currentTarget.id; //通过id传参的时候如果传的是number 会自动转换成string
        // this.setData({navId:navId*1})
        let navId = event.currentTarget.dataset.id
        this.setData({
            navId:navId,
            videoList:[]
        })
        // 显示正在加载
        wx.showLoading({
            title:'正在加载'
        })
        // 动态获取当前导航对应的视频数据
        
        this.getVideoList(this.data.navId)
    },
         // 点击播放/继续播放的回调
   
    handlePlay(event){
    /*
    问题：多个视频同时播放
    需求：
        1.在点击播放的时间中需要找到上一个播放的视频
        2.在播放新视频之前关闭上一个正在播放的视频
    关键：
        1.如何找到上一个视频的实例对象
        2.如何确认点击播放的视频和正在播放的视频不是在同一个视频
    单例模式：
        1.需要创建多个对象的场景 通过一个变量接受 始终保持只有一个对象
        2.节省内存空间
    */
   let vid = event.currentTarget.id;
   this.vid !==vid && this.videoContext &&this.videoContext.stop();
        this.vid = vid;
//    创建控制video标签的实例对象
        this.videoContext = wx.createVideoContext(vid)
        // console.log('paly')
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