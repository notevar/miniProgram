import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import './seat.scss'
export default class Seat extends Component {
  config ={
    enablePullDownRefresh:false
  }
  constructor(props){
    super(props);
    this.state = {
      seatData:[],
      statusMap:{
        can:"https://p1.meituan.net/movie/9dfff6fd525a7119d44e5734ab0e9fb41244.png",
        No:"https://p1.meituan.net/movie/bdb0531259ae1188b9398520f9692cbd1249.png",
        select:"https://p0.meituan.net/movie/585588bd86828ed54eed828dcb89bfdd1401.png"
      },
      active:'0',
      seatArray:[],
      buySeat:[]
    }

  }
  initParams(){
    const params = this.$router.params;
    const self = this;
    Taro.setNavigationBarTitle({
      title:params.cinemaName
    })
    Taro.showLoading({
      title:"加载中..."
    });
    Taro.request({
      url:`https://m.maoyan.com/ajax/seatingPlan?timestamp=${Date.now()}`,
      method:'post',
      header:{
        'Cookie': 'uuid_n_v=v1; iuuid=26F6BA50506A11E9A973FDD3C7EBDF0E29C7297EC72D4F77A53F9445EF0EE9F3; webp=true; ci=20%2C%E5%B9%BF%E5%B7%9E; _lxsdk_cuid=169be42cf28c8-098c7e821e63bd-2d604637-3d10d-169be42cf29c8; _lxsdk=26F6BA50506A11E9A973FDD3C7EBDF0E29C7297EC72D4F77A53F9445EF0EE9F3; from=canary; uid=124265875; token=9P1-5VoykD_qrpBxpTvSoVhMwzQAAAAAJwgAAE2za6eVZdI-oORrTHb8dP4JEMYCiza0zSSNoRkHx4qajm2Nu6ClhU00u5A1avIySg; __mta=250960825.1553675243337.1553675275840.1553675275842.6; user=124265875%2C9P1-5VoykD_qrpBxpTvSoVhMwzQAAAAAJwgAAE2za6eVZdI-oORrTHb8dP4JEMYCiza0zSSNoRkHx4qajm2Nu6ClhU00u5A1avIySg; _lxsdk_s=169be42cf2b-ca7-4ca-570%7C%7C14'
      },
      data:{
        cityId:params.cityId,
        ci:params.ci,
        seqNo:params.seqNo
      }
    }).then(res=>{
      if(res.statusCode ==200){
        Taro.hideLoading();
        const seatData = res.data.seatData;
        const seatArray = [];
        seatData.seat.sections[0].seats.map(item=>{
          let  arr = [];
          item["columns"].map(seat=>{
            if(seat["st"] == "N"){
              arr.push('0');
            }else{
              arr.push('E')
            }
          })
          seatArray.push(arr);
        })
        self.setState({
          seatData:seatData,
          seatArray:seatArray
        });
      }
    })
  }
  selectSeat(row,column,item){
    const self = this;
    const arr = this.state.seatArray;
    if(item == 0){
      if(self.state.buySeat.length ==4){
        Taro.showToast({
          title: '最多选择4个座位',
          duration: 2000
        })
        return false;
      }else{
        let  buySeat = self.state.buySeat;
        arr[row][column]= '2';
        buySeat.push({
          "row":row,
          "column":column
        });
        self.setState({
          buySeat:buySeat,
          seatArray:arr
        })
      }
    }else{
      arr[row][column]= '0';
      const  buySeat = this.state.buySeat;
      let tmpArr = this.state.buySeat;
      buySeat.map((value,index)=>{
        if(value["row"]== row && value["column"]== column){
          tmpArr.splice(index,1);
          self.setState({
            buySeat:tmpArr,
            seatArray:arr
          })
        }
      })
    }

  }
  selectAll(seats){
    const self = this;
    seats.map(item=>{
      let row = parseInt(item.rowId.split('0')[0]);
      let column = parseInt(item.columnId.split('0')[0]);
      let itemIndex = self.state.seatArray[row][column];
      self.selectSeat(row,column,itemIndex);
    })

  }
  getRecomment(recomment,num){
    switch(num){
      case 1:this.selectAll(recomment.bestOne.seats);break;
      case 2:this.selectAll(recomment.bestTwo.seats);break;
      case 3:this.selectAll(recomment.bestThree.seats);break;
      case 4:this.selectAll(recomment.bestFour.seats);break;
    }
  }
  deleteBuy(item){
    const row = item.row;
    const column = item.column;
    const status = this.state.seatArray[row][column];
    this.selectSeat(row,column,status);
  }
  navigate(url){
    Taro.navigateTo({
      url:url
    });
  }
  componentDidMount () {
    this.initParams();
  }
  render () {
    const show = this.state.seatData.show;
    const hall = this.state.seatData.hall;
    const movie = this.state.seatData.movie;
    const seatInfo = this.state.seatData.seat?this.state.seatData.seat.sections[0]:[];
    const seatTypeList = this.state.seatData.seat?this.state.seatData.seat.seatTypeList:[];
    const seatMap = this.state.statusMap;
    const seatArray = this.state.seatArray;
    const recomment = this.state.seatData.seat?this.state.seatData.seat.bestRecommendation:[];
    const price = this.state.seatData.price?Math.floor(this.state.seatData.price.seatsPriceDetail[1].originPrice):[];
    return (
      <View className="selectSeat">
        <View className="header">
          <View className="title">{movie.movieName}</View>
          <View className="desc">
            <Text className="time">{show.showDate} {show.showTime}</Text>
            <Text classname="lang"><Text className="language">{show.lang}</Text><Text className="dim">{show.dim}</Text></Text>
          </View>
        </View>
        <View className="seatCon">
          <View className="hallCon">
            <View className="hallName">{hall.hallName}</View>
          </View>
          <View className="seatMore">
            <View className="rowList">
              {
                seatInfo.seats.map((item,index)=>{
                  return (
                    <View className="numberId" key={key}>{index+1}</View>
                  )
                })
              }
            </View>
            <View className="Container">
              {
                Object.keys(seatArray).map(key=>{
                  return (
                    <View className="rowWrap" key={key}>
                      {
                        seatArray[key].map((item,index)=>{
                          return (
                            <View className="seatWrap" key={index}>
                              {item == '0'?<Image src={seatMap.can} onClick={this.selectSeat.bind(this,key,index,item)}></Image>:(item == '2'?<Image src={seatMap.select}  onClick={this.selectSeat.bind(this,key,index,item)}></Image>:<Text></Text>)}
                            </View>
                          )
                        })
                      }
                    </View>
                  )
                })
              }
            </View>
            </View>
        </View>
        <View className="type">
          {
            seatTypeList.map((item,index)=>{
              return (
                <View className="item" key={index}>
                  <Image src={item.icon}></Image>
                  <Text className="word">{item.name}</Text>
                </View>
              )
            })
          }
        </View>
        <View className="comment">
          <View className="title">推荐</View>
          <View className="btn" className={this.state.buySeat.length == 0?'btn':'hide btn'}>
            <View className="btnItem" onClick={this.getRecomment.bind(this,recomment,1)}>1人</View>
            <View className="btnItem" onClick={this.getRecomment.bind(this,recomment,2)}>2人</View>
            <View className="btnItem" onClick={this.getRecomment.bind(this,recomment,3)}>3人</View>
            <View className="btnItem" onClick={this.getRecomment.bind(this,recomment,4)}>4人</View>
          </View>
          <View className={this.state.buySeat.length == 0?'btn hide':'btn'}>
            {
              this.state.buySeat.map((item,index)=>{
                return (
                  <View className="btnItem" key={index} onClick={this.deleteBuy.bind(this,item)}>
                    {(item.row)*1+1}排{item.column}座
                  </View>
                )
              })
            }
          </View>
        </View>
        <View className={this.state.buySeat.length == 0?'buyBtn':'hide buyBtn'}>请先选座</View>
        <View className={this.state.buySeat.length == 0?'hide buyBtn':'buyBtn active'} onClick={this.navigate.bind(this,'../order/order')}>￥{this.state.buySeat.length*price} 确认选座</View>
      </View>
    );
  }
}
