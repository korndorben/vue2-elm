<template>
<div class="confirmOrderContainer">
  <section v-if="!showLoading">
    <head-top head-title="确认订单" goBack="true" signin-up='confirmOrder'></head-top>

    <section class="food_list">
      <header v-if="checkoutData.cart.restaurant_info">
        <img src="http://localhost:3000/upload/logo.1.png">
        <span>{{checkoutData.cart.restaurant_info.name}}</span>
      </header>
      <ul class="food_list_ul" v-if="checkoutData.cart.groups">
        <li v-for="item in checkoutData.cart.groups[0]" :key="item.id" class="food_item_style">
          <p class="food_name ellipsis">{{item.name}} x {{item.quantity}}</p>
          <div class="num_price">
            <span></span>
            <span>¥{{item.price}}</span>
          </div>
        </li>
      </ul>
      <div class="food_item_style" v-if="checkoutData.cart.extra">
        <p class="food_name ellipsis">{{checkoutData.cart.extra[0].name}}</p>
        <div class="num_price">
          <span></span>
          <span>¥ {{checkoutData.cart.extra[0].price}}</span>
        </div>
      </div>
      <div class="food_item_style total_price">
        <p class="food_name ellipsis">订单 ¥{{checkoutData.cart.total}}</p>
        <div class="num_price">
          <span></span>
          <span>待支付 ¥{{checkoutData.cart.total}}</span>
        </div>
      </div>
    </section>
    <section class="pay_way container_style">
      <header class="header_style">
        <span>支付方式</span>
        <div class="more_type" @click="showPayWayFun">
          <span>在线支付</span>
          <svg class="address_empty_right">
                            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow-right"></use>
                        </svg>
        </div>
      </header>
      <section data-v-4e0d5034="" class="hongbo">
        <span data-v-4e0d5034="">优惠+积分</span>
        <span data-v-4e0d5034="">积分抵扣 1 元</span>
      </section>
    </section>
    <section class="pay_way container_style">
      <router-link :to='{path: "/confirmOrder/remark", query: {id: checkoutData.cart.id, sig: checkoutData.sig}}' class="header_style">
        <span>订单备注</span>
        <div class="more_type">
          <span class="ellipsis">{{remarkText||inputText? remarklist: '口味、偏好等'}}</span>
          <svg class="address_empty_right">
                            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow-right"></use>
                        </svg>
        </div>
      </router-link>
    </section>
    <section class="confrim_order">
      <p>待支付 ¥{{checkoutData.cart.total}}</p>
      <p @click="onBridgeReady">确认下单</p>
    </section>
    <transition name="fade">
      <div class="cover" v-if="showPayWay" @click="showPayWayFun"></div>
    </transition>
    <transition name="slid_up">
      <div class="choose_type_Container" v-if="showPayWay">
        <header>支付方式</header>
        <ul>
          <li v-for="item in checkoutData.payments" :key="item.id" :class="{choose: payWayId == item.id}">
            <span>{{item.name}}<span v-if="!item.is_online_payment">{{item.description}}</span></span>
            <svg class="address_empty_right" @click="choosePayWay(item.is_online_payment, item.id)">
                                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#select"></use>
                            </svg>
          </li>
        </ul>
      </div>
    </transition>
  </section>
  <loading v-if="showLoading"></loading>
  <alert-tip v-if="showAlert" @closeTip="showAlert = false" :alertText="alertText"></alert-tip>
  <transition name="router-slid" mode="out-in">
    <router-view></router-view>
  </transition>
</div>
</template>

<script>
import {
  mapState,
  mapMutations
} from 'vuex'
import headTop from 'src/components/header/head'
import alertTip from 'src/components/common/alertTip'
import loading from 'src/components/common/loading'
import {
  checkout,
  getAddress,
  placeOrders,
  getAddressList
} from 'src/service/getData'
import {
  imgBaseUrl
} from 'src/config/env'
import fetchql from '../../fetchql'

export default {
  data() {
    return {
      geohash: '', //geohash位置信息
      shopId: null, //商店id值
      showLoading: true, //显示加载动画
      checkoutData: null, //数据返回值
      shopCart: null, //购物车数据
      imgBaseUrl, //图片域名
      showPayWay: false, //显示付款方式
      payWayId: 1, //付款方式
      showAlert: false, //弹出框
      alertText: null, //弹出框内容
    }
  },
  created() {
    //获取上个页面传递过来的geohash值
    // this.geohash = this.$route.query.geohash;
    //获取上个页面传递过来的shopid值
    this.shopId = this.$route.query.shopId;
    this.INIT_BUYCART();
    this.SAVE_SHOPID(this.shopId);
    // //获取当前商铺购物车信息
    this.shopCart = this.cartList[this.shopId];
  },
  mounted() {
    this.initData();
  },
  components: {
    headTop,
    alertTip,
    loading,
  },
  computed: {
    ...mapState([
      'cartList', 'remarkText', 'inputText'
    ]),
    //备注页返回的信息进行处理
    remarklist: function() {
      let str = new String;
      if (this.remarkText) {
        Object.values(this.remarkText).forEach(item => {
          str += item[1] + '、';
        })
      }
      //是否有自定义备注，分开处理
      if (this.inputText) {
        return str + this.inputText;
      } else {
        return str.substr(0, str.lastIndexOf('，'));
      }
    },
  },
  methods: {
    ...mapMutations([
      'INIT_BUYCART', 'SAVE_CART_ID_SIG', 'SAVE_ORDER_PARAM', 'ORDER_SUCCESS', 'SAVE_SHOPID'
    ]),
    async onBridgeReady() {
      let result = await fetchql.query({
        operationName: '',
        query: 'mutation ($openid: String!, $body: String!, $out_trade_no: String!, $total_fee: Int!) { wechath5pay(openid: $openid, body: $body, out_trade_no: $out_trade_no, total_fee: $total_fee) { appId timeStamp nonceStr package signType paySign } } ',
        variables: {
          "openid": "oTIub0siUJpf6DDfRAmLduQcTHHc",
          "body": "KFC",
          "out_trade_no": "1123",
          "total_fee": 10
        }
      })
    //   console.log(result.data.wechath5pay);
    //   return
      WeixinJSBridge.invoke(
        'getBrandWCPayRequest', Object.assign({}, result.data.wechath5pay),
        function(res) {
          if (res.err_msg == "get_brand_wcpay_request:ok") {} // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
        }
      );
    // }
    if (typeof WeixinJSBridge == "undefined") {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    } else {
      onBridgeReady();
    }
  },

  //初始化数据
  async initData() {
    let newArr = new Array;
    Object.values(this.shopCart).forEach(categoryItem => {
      Object.values(categoryItem).forEach(itemValue => {
        Object.values(itemValue).forEach(item => {
          newArr.push({
            attrs: [],
            extra: {},
            id: item.id,
            name: item.name,
            packing_fee: item.packing_fee,
            price: item.price,
            quantity: item.num,
            sku_id: item.sku_id,
            specs: [item.specs],
            stock: item.stock,
          })
        })
      })
    })
    //检验订单是否满足条件
    // this.checkoutData = await checkout(this.geohash, [newArr], this.shopId);
    this.checkoutData = JSON.parse(
      `{
                    "id":23742,
                    "delivery_reach_time":"01:06",
                    "sig":"922316",
                    "_id":"5a09c1d0deb3f2627afbb852",
                    "is_support_ninja":1,
                    "is_support_coupon":false,
                    "deliver_times_v2":[

                    ],
                    "deliver_times":[

                    ],
                    "payments":[
                        {
                            "select_state":1,
                            "name":"在线支付",
                            "id":1,
                            "disabled_reason":"",
                            "description":"（商家仅支持在线支付）",
                            "promotion":[

                            ],
                            "is_online_payment":true
                        },
                        {
                            "select_state":-1,
                            "name":"货到付款",
                            "id":2,
                            "disabled_reason":"商家仅支持在线支付",
                            "description":"（商家不支持货到付款）",
                            "promotion":[

                            ],
                            "is_online_payment":false
                        }
                    ],
                    "invoice":{
                        "status_text":"不需要开发票",
                        "is_available":true
                    },
                    "cart":{
                        "id":23742,
                        "deliver_amount":4,
                        "is_deliver_by_fengniao":true,
                        "original_total":443,
                        "phone":"15761621234",
                        "restaurant_id":1148,
                        "restaurant_info":{
                            "_id":"59a816cbebe2e53edc090e32",
                            "name":"测试修22225",
                            "address":"北京市海淀区岭南路36号广东大厦5层",
                            "id":1148,
                            "latitude":39.92775,
                            "longitude":116.30162,
                            "location":[
                                121.49424,
                                31.30122
                            ],
                            "phone":"15761621234",
                            "category":"异国料理/西餐",
                            "__v":0,
                            "supports":[
                                {
                                    "description":"已加入“外卖保”计划，食品安全有保障",
                                    "icon_color":"999999",
                                    "icon_name":"保",
                                    "id":7,
                                    "name":"外卖保",
                                    "_id":"59a816cbebe2e53edc090e35"
                                },
                                {
                                    "description":"准时必达，超时秒赔",
                                    "icon_color":"57A9FF",
                                    "icon_name":"准",
                                    "id":9,
                                    "name":"准时达",
                                    "_id":"59a816cbebe2e53edc090e34"
                                },
                                {
                                    "description":"该商家支持开发票，请在下单时填写好发票抬头",
                                    "icon_color":"999999",
                                    "icon_name":"票",
                                    "id":4,
                                    "name":"开发票",
                                    "_id":"59a816cbebe2e53edc090e33"
                                }
                            ],
                            "status":0,
                            "recent_order_num":827,
                            "rating_count":485,
                            "rating":4.1,
                            "promotion_info":"dghgfdgf",
                            "piecewise_agent_fee":{
                                "tips":"配送费约¥5"
                            },
                            "opening_hours":[
                                "8:30/20:30"
                            ],
                            "license":{
                                "catering_service_license_image":"15e3898ec2b5718.jpeg",
                                "business_license_image":"15e3898f5d05717.jpeg"
                            },
                            "is_new":true,
                            "is_premium":true,
                            "image_path":"15fa3a071f210067.jpg",
                            "identification":{
                                "registered_number":"",
                                "registered_address":"",
                                "operation_period":"",
                                "licenses_scope":"",
                                "licenses_number":"",
                                "licenses_date":"",
                                "legal_person":"",
                                "identificate_date":null,
                                "identificate_agency":"",
                                "company_name":""
                            },
                            "float_minimum_order_amount":20,
                            "float_delivery_fee":5,
                            "distance":"",
                            "order_lead_time":"",
                            "description":"vbn11",
                            "delivery_mode":{
                                "color":"57A9FF",
                                "id":1,
                                "is_solid":true,
                                "text":"蜂鸟专送"
                            },
                            "activities":[
                                {
                                    "icon_name":"减",
                                    "name":"满减优惠",
                                    "description":"满30减5，满60减8",
                                    "icon_color":"f07373",
                                    "id":1,
                                    "_id":"59a816cbebe2e53edc090e36"
                                }
                            ]
                        },
                        "restaurant_minimum_order_amount":20,
                        "total":443,
                        "service_fee_explanation":0,
                        "restaurant_status":1,
                        "promise_delivery_time":0,
                        "ontime_status":0,
                        "must_pay_online":0,
                        "must_new_user":0,
                        "is_ontime_available":0,
                        "is_online_paid":1,
                        "is_address_too_far":false,
                        "extra":[
                            {
                                "description":"",
                                "_id":"5a09c1d0deb3f2627afbb853",
                                "type":0,
                                "quantity":1,
                                "price":379,
                                "name":"餐盒"
                            }
                        ],
                        "groups":[
                            [
                                {
                                    "id":1945,
                                    "name":"水淀",
                                    "packing_fee":0,
                                    "price":20,
                                    "quantity":3,
                                    "sku_id":1943,
                                    "stock":1000,
                                    "_id":"5a09c1d0deb3f2627afbb854",
                                    "specs":[
                                        ""
                                    ],
                                    "new_specs":[

                                    ],
                                    "extra":[
                                        null
                                    ],
                                    "attrs":[

                                    ]
                                }
                            ]
                        ]
                    }
                }
`
    )
    this.SAVE_CART_ID_SIG({
      cart_id: this.checkoutData.cart.id,
      sig: this.checkoutData.sig
    })
    this.showLoading = false;
  },

  //显示付款方式
  showPayWayFun() {
    this.showPayWay = !this.showPayWay;
  },
  //选择付款方式
  choosePayWay(is_online_payment, id) {
    if (is_online_payment) {
      this.showPayWay = !this.showPayWay;
      this.payWayId = id;
    }
  },
  //确认订单
  async confrimOrder() {
    //用户未登录时弹出提示框
    //保存订单
    this.SAVE_ORDER_PARAM({
      user_id: this.userInfo.user_id,
      cart_id: this.checkoutData.cart.id,
      address_id: this.choosedAddress.id,
      description: this.remarklist,
      entities: this.checkoutData.cart.groups,
      geohash: this.geohash,
      sig: this.checkoutData.sig,
    });
    //发送订单信息
    let orderRes = await placeOrders(this.userInfo.user_id, this.checkoutData.cart.id, this.choosedAddress.id, this.remarklist, this.checkoutData.cart.groups, this.geohash, this.checkoutData.sig);
    //第一次下单的手机号需要进行验证，否则直接下单成功
    if (orderRes.need_validation) {
      this.NEED_VALIDATION(orderRes);
      this.$router.push('/confirmOrder/userValidation');
    } else {
      this.ORDER_SUCCESS(orderRes);
      this.$router.push('/confirmOrder/payment');
    }
  },
},
}
</script>

<style lang="scss" scoped>
@import 'src/style/mixin';

.confirmOrderContainer {
    padding-top: 1.95rem;
    padding-bottom: 3rem;
    p,
    span {
        font-family: Helvetica Neue,Tahoma,Arial;
    }
}
.container_style {
    background-color: #fff;
    margin-top: 0.4rem;
    padding: 0 0.7rem;
}
.address_container {
    min-height: 3.5rem;
    @include fj;
    align-items: center;
    padding: 0 0.6rem;
    background: url("../../images/address_bottom.png") left bottom repeat-x;
    background-color: #fff;
    background-size: auto 0.12rem;
    .address_empty_left {
        display: flex;
        align-items: center;
        .location_icon {
            @include wh(0.8rem, 0.8rem);
            fill: $blue;
            margin-right: 0.2rem;
        }
        .add_address {
            @include sc(0.7rem, #333);
        }
        .address_detail_container {
            margin-left: 0.2rem;
            header {
                @include sc(0.65rem, #333);
                span:nth-of-type(1) {
                    font-size: 0.8rem;
                    font-weight: bold;
                }
            }
            .address_detail {
                width: 100%;
                display: flex;
                align-items: center;
                span {
                    @include sc(0.5rem, #fff);
                    border-radius: 0.15rem;
                    background-color: #ff5722;
                    height: 0.6rem;
                    line-height: 0.6rem;
                    padding: 0 0.2rem;
                    margin-right: 0.3rem;
                }
                p {
                    @include sc(0.55rem, #777);
                }
            }
        }
    }
}
.address_empty_right {
    @include wh(0.6rem, 0.6rem);
    fill: #999;
}
.delivery_model {
    border-left: 0.2rem solid $blue;
    min-height: 4rem;
    @include fj;
    align-items: center;
    .deliver_text {
        @include sc(0.8rem, #333);
        font-weight: bold;
        padding-left: 0.3rem;
    }
    .deliver_time {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        p:nth-of-type(1) {
            @include sc(0.7rem, $blue);
        }
        p:nth-of-type(2) {
            @include sc(0.5rem, #fff);
            background-color: $blue;
            width: 2.4rem;
            margin-top: 0.5rem;
            text-align: center;
            border-radius: 0.12rem;
            padding: 0.1rem;
        }
    }
}
.pay_way {
    .header_style {
        @include fj;
        line-height: 2rem;
        span:nth-of-type(1) {
            @include sc(0.7rem, #666);
        }
        .more_type {
            span:nth-of-type(1) {
                @include sc(0.6rem, #aaa);
                width: 10rem;
                display: inline-block;
                text-align: right;
                vertical-align: middle;
            }
            svg {
                @include wh(0.5rem, 0.5rem);
                fill: #ccc;
            }
        }
    }
    .hongbo {
        @include fj;
        border-top: 0.025rem solid #f5f5f5;
        span {
            @include sc(0.6rem, #aaa);
            line-height: 2rem;
            svg {
                @include wh(0.5rem, 0.5rem);
                vertical-align: middle;
                fill: #ccc;
            }
        }
        span:nth-of-type(2) {
            color: #aaa;
        }
    }
    .support_is_available {
        span {
            color: #666;
        }
    }
}
.food_list {
    background-color: #fff;
    margin-top: 0.4rem;
    header {
        padding: 0.7rem;
        border-bottom: 0.025rem solid #f5f5f5;
        img {
            @include wh(1.2rem, 1.2rem);
            vertical-align: middle;
        }
        span {
            @include sc(0.8rem, #333);
        }
    }
    .food_list_ul {
        padding-top: 0.5rem;
    }
    .food_item_style {
        @include fj;
        line-height: 1.8rem;
        padding: 0 0.7rem;
        p,
        span {
            @include sc(0.65rem, #666);
        }
        display: flex;
        .food_name {
            flex: 1;
            // width: 11rem;
        }
        .num_price {
            flex: 1;
            @include fj;
            // justify-content: space-between;
            // align-items: center;
            // align-self: flex-end;
            // text-align: right;
            // align-items: right;
            span:nth-of-type(1) {
                color: #f60;
            }
        }
    }
    .total_price {
        border-top: 0.025rem solid #f5f5f5;
    }
}
.confrim_order {
    display: flex;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 2rem;
    // font-family: 'Roboto-Bold';
    font-weight: 400;
    p {
        line-height: 2rem;
        @include sc(0.75rem, #fff);
    }
    p:nth-of-type(1) {
        background-color: #3c3c3c;
        flex: 5;
        padding-left: 0.7rem;
    }
    p:nth-of-type(2) {
        flex: 2;
        background-color: #56d176;
        text-align: center;
    }
}
.cover {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,.3);
    z-index: 203;
}
.choose_type_Container {
    min-height: 10rem;
    background-color: #fff;
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 204;
    header {
        background-color: #fafafa;
        @include sc(0.7rem, #333);
        text-align: center;
        line-height: 2rem;
    }
    ul {
        li {
            @include fj;
            padding: 0 0.7rem;
            line-height: 2.5rem;
            align-items: center;
            span {
                @include sc(0.7rem, #ccc);
            }
            svg {
                @include wh(0.8rem, 0.8rem);
                fill: #eee;
            }
        }
        .choose {
            span {
                color: #333;
            }
            svg {
                fill: #4cd964;
            }
        }
    }
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-active {
    opacity: 0;
}
.slid_up-enter-active,
.slid_up-leave-active {
    transition: all 0.3s;
}
.slid_up-enter,
.slid_up-leave-active {
    transform: translate3d(0,10rem,0);
}
.router-slid-enter-active,
.router-slid-leave-active {
    transition: all 0.4s;
}
.router-slid-enter,
.router-slid-leave-active {
    transform: translate3d(2rem, 0, 0);
    opacity: 0;
}
</style>
