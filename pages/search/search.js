// pages/search/search.jsort
import request from '../../utils/request';
let isSend = false;//用于函数节流使用 
Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeholderContent:'',//placeholder的内容
        hotList:[],//热搜的数据
        searchContent:'', //用于输入表单项的数据
        searchList:[], //关键词模糊匹配的数据
        historyList:[] //搜索的历史记录
        

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取初始化数据
        this.getInitData();
        // 获取历史记录
        this.getHistoryList();
    },
    // 从Storage 获取本地历史记录的功能函数
    getHistoryList(){
       let historyList= wx.getStorageSync('historyList');
       if(historyList){
        this.setData({
            historyList
        })
       }
      
    },
    // 获取初始化数据

    async getInitData(){
        let placeholderData = await request('/search/default')
        let hotListData = await request('/search/hot/detail')
        // console.log(searchContentData)
        this.setData({
            placeholderContent:placeholderData.data.showKeyword,
            hotList:hotListData.data
        })
    },
    // handleInputChange 表单项内容发生改变的回调
  handleInputChange(e){
        // 更新searchContent的状态数据
        this.setData({
            // trim() 删除字符串的头尾空白符，空白符包括：空格、制表符 tab、换行符等其他空白符等。  不会改变原始字符串
            searchContent:e.detail.value.trim()
        })
        if(isSend){
            return;
        }
        isSend = true;
        this.getSearchList();
        // 函数节流
        setTimeout( ()=>{
            isSend = false;
        },300)
      
    },
    // 获取搜索数据的功能函数
    async getSearchList(){
        if(!this.data.searchContent){
            this.setData({
              searchList: []
            })
            return;
          }
          //将搜索的关键字放入historyList历史记录中
          let {searchContent, historyList} = this.data;
        // 发送请求获取关键词模糊匹配的数据
        let searchListData = await request('/search',{keywords:searchContent, limit:10});
        this.setData({
            searchList:searchListData.result.songs
        });
        // 若原始historyList中没有该搜索关键词则放入其中，若有则将其先删除后将其放在最前面（数组中下标为0）
        if(historyList.indexOf(searchContent) !== -1 ){
            historyList.splice(historyList.indexOf(searchContent),1)
        }
        historyList.unshift(searchContent);
        this.setData({
            historyList
        })
        // 将搜索的历史记录放进cookie中
        wx.setStorageSync('historyList', historyList)
    },
    // 清空搜索内容
    clearSearchContent(){
        this.setData({
            searchContent:'',
            searchList:[]
        })
    },
    // 删除搜索历史记录
    deleteSearchHistory(){
        wx.showModal({
            content: '是否删除搜索历史记录？',
            success:(res) =>{
              if (res.confirm) {
                //  清空data中的historyList
                this.setData({
                    historyList:[]
                })
                // 移除本地缓存的搜索记录
                wx.removeStorageSync('historyList')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
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