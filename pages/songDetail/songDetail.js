// pages/songDetail/songDetail.js

import PubSub, { publish } from 'pubsub-js';
import moment from 'moment';
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
        musicId:'', //音乐id
        musicLink:'', //音乐链接
        currentTime:'00:00',//实时时间
        durationTime:'00:00', //总时长
        currentWidth:0,//实时进度条长
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log(options.musicId)
        // options:用于接收 路由跳转的query参数
        // 原生的小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
        let musicId = options.musicId;
        this.setData({
            musicId
        })
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
        // 监听音乐自然结束
        this.backgroundAudioManager.onEnded(()=>{
            // 自动切换成下一首音乐，并自动播放
            PubSub.publish('switchType', 'next');
            this.musicAutoPlay()
            
            // 实时进度条的长度 实时播放的时间还原成0
            this.setData({
                currentWidth:0,
                currentTime: "00:00"
            })
        });
        // 监听音乐实时播放的进度
        this.backgroundAudioManager.onTimeUpdate(() => {
            //console.log('总时长：',this.backgroundAudioManager.duration)
            //console.log('实时的时长：',this.backgroundAudioManager.currentTime)

            // 格式化实时的播放时间
            let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format("mm:ss");
            let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450;
            
            this.setData({
                currentTime,
                currentWidth
            })
        })
    },
        // 修改音乐播放状态的功能函数
        changePlayState(isPlay){
            this.setData({
                isPlay
            });
            // 修改全局音乐播放状态
            appInstance.globalData.isMusicPlay=isPlay;
        },
          // 获取歌曲的详情
       async getMusicInfo(musicId){
        let songData = await requset('/song/detail',{ids:musicId});
        let durationTime = moment(songData.songs[0].dt).format('mm:ss')
        this.setData({
            song:songData.songs[0],
            durationTime
        });
        // 动态修改窗口的歌曲名称
        wx.setNavigationBarTitle({
            title:this.data.song.name
        })
    },
    // 控制音乐播放/赞同的 功能函数
    async musicControl(isPlay,musicId, musicLink){
        if(isPlay){//音乐播放
            if(!musicLink){
                // 获取获取音乐播放音频url
                let musicLinkData = await requset('/song/url',{id:musicId});
                musicLink = musicLinkData.data[0].url;
                this.setData({
                    musicLink
                })
            }   
            // title 必填 src 必填
            this.backgroundAudioManager.title = this.data.song.name;
            this.backgroundAudioManager.src = musicLink;
        }else{
            // 暂停播放
            this.backgroundAudioManager.pause();

        }
    },
      // 控制音乐播放/暂停的回调
      handleMusicPlay(){
        let isPlay = !this.data.isPlay;
        let {musicId, musicLink} = this.data
        this.musicControl(isPlay, musicId, musicLink)
    },
    // 点击切歌的回调  songDetail相当于（发布方 PubSub.publish(事件名，提供的数据) 发送数据）  至 recommendSong （订阅方 PubSub.subscribe(事件名，事件的回调)）接收数据
    handleSwitch(e){
        // 获取切歌的类型
        let type = e.currentTarget.id;
        //关闭当前的音乐
        this.backgroundAudioManager.stop();
        // 订阅来自recommendSong页面发布的musicId消息
        // PubSub.subscribe('musicId',(msg, musicId)=>{
        //     console.log(musicId);
        //     //获取音乐详情信息
        //     this.getMusicInfo(musicId);
        //     // 自动播放当前的音乐
        //     this.musicControl(true, musicId);
        //     // 取消订阅
        //     PubSub.unsubscribe('musicId')
        // });
        this.musicAutoPlay()
        // 发布消息数据到recommendSong页面
        PubSub.publish('switchType',type);
    
        
    },
    // 自动播放音乐    （后期需要完善）
    musicAutoPlay(){
        // 订阅来自recommendSong页面发布的musicId消息
        PubSub.subscribe('musicId',(msg, musicId)=>{
            console.log(musicId);
            //获取音乐详情信息
            this.getMusicInfo(musicId);
            // 自动播放当前的音乐
            this.musicControl(true, musicId);
            // 取消订阅
            PubSub.unsubscribe('musicId')
        });
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