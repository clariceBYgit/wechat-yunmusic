// pages/songDetail/songDetail.js
import requset from '../../utils/request';
// 获取全局实例
const appInstance = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay:false, //是否播放音乐
        song:{}, //歌曲详情对象
        musicId:'' //音乐id
    },
  
       // 获取歌曲的详情
       async getMusicInfo(musicId){
        let songData = await requset('/song/detail',{ids:musicId});
        console.log(songData.songs[0])
        this.setData({
            song:songData.songs[0],
            musicId
        });
        // 动态修改窗口的歌曲名称
        wx.setNavigationBarTitle({
            title:this.data.song.name
        })
    },
    // 控制音乐播放/赞同的 功能函数
    async musicControl(isPlay,musicId){
        if(isPlay){//音乐播放
            // 获取获取音乐播放音频url
            let musicLinkData = await requset('/song/url',{id:musicId});
            // title 必填 src 必填
            this.backgroundAudioManager.title = this.data.song.name;
            this.backgroundAudioManager.src = musicLinkData.data[0].url;
        }else{
            // 暂停播放
            this.backgroundAudioManager.pause();

        }
    },
      // 控制音乐播放/暂停的回调
      handleMusicPlay(){
        let isPlay = !this.data.isPlay;
        this.musicControl(isPlay,this.data.musicId)
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log(options.musicId)
        // options:用于接收 路由跳转的query参数
        // 原生的小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
        let musicId = options.musicId;
        // 获取音乐详情
        this.getMusicInfo(musicId);
        /**
         * 问题：如果用户操作系统的控制音乐播放/暂停的 按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
         * 解决方案：
         *  1.通过控制音频的实例 backgroundAudioManager 去监听音乐播放/暂停
         * 
         * 
         */
        // 判断当前的页面的音乐是否在播放
        if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
            // 修改当前页面的音乐播放状态为true
            this.setData({
                isPlay:true
            })
        };


          // wx.getBackgroundAudioManager() 创建音频实例
        this.backgroundAudioManager= wx.getBackgroundAudioManager();
        // 监视音乐播放/暂停/停止
        this.backgroundAudioManager.onPlay(()=>{
            // 修改音乐的状态
            this.changePlayState(true)
            // 修改全局音乐播放状态 音乐id
            appInstance.globalData.musicId = musicId;

        });
        this.backgroundAudioManager.onPause(()=>{
            // 修改全局音乐播放的状态
            this.changePlayState(false)

        });
        this.backgroundAudioManager.onStop(()=>{
            this.changePlayState(false)

        });
    },
        // 修改音乐播放状态的功能函数
        changePlayState(isPlay){
            this.setData({
                isPlay
            });
            // 修改全局音乐播放状态
            appInstance.globalData.isMusicPlay=isPlay;
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