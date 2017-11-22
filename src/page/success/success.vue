<style lang="scss" scoped>
@import 'src/style/mixin';
.success_page {
    background-color: #fff;
    z-index: 202;
    padding-top: 2.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 16px;
    width: 100%;
    .mealorder {
        .supplier {
            // font-weight: bold;
            padding: 1rem;
        }
        .mealcode {
            font-size: 90px;
            font-family: Roboto;
            font-weight: 300;
            background-color: #eee;
            border-top: 1px solid rgba(0,0,0,0.15);
            border-bottom: 1px solid rgba(0,0,0,0.15);
            opacity: 0.7;
            background-image: url("../../images/bg.svg");
            text-align: center;
			padding: 2rem;
        }
        .tips {
            display: flex;
            // align-items: center;
            justify-content: center;
            flex-direction: column;

            padding-top: 1rem;
            .row {
                .dt {
                    text-align: right;
                    width: 100px;
                    // border: 1px solid red;
                }
                .dd {
                    text-indent: 1rem;
                    flex: 1;
                }
                display: flex;
                // align-items: center;
                justify-content: center;
                flex-direction: row;
            }
        }
        height: 100vh;
        width: 100%;
    }
}
</style>

<template>
<div class="success_page">
  <section class="mealorder">
    <head-top :head-title="mealorder.supplier.name" go-back='true'></head-top>
    <div class="supplier">
      您的取餐码是
    </div>
    <div class="mealcode">
      {{mealorder.mealcode}}
    </div>
    <div class="tips">

      <div class="row">
        <div class="dt">
          支付金额
        </div>
        <div class="dd">
          2.00元
        </div>
      </div>
      <div class="row">
        <div class="dt">
          订单号
        </div>
        <div class="dd">
          {{mealorder.code}}
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<script>
import headTop from 'src/components/header/head'
import fetchql from '../../fetchql'
export default {
  data() {
    return {
      shopId: null, //商店id值
      orderid: null,
      mealorder: {
        customer: {},
        supplier: {},
        mealorderdetail: []
      }
    }
  },
  created() {
    this.shopId = location.host.substring(4, location.host.indexOf('.nm.etao.cn')) * 1;
    if (Number.isNaN(this.shopId)) {
      this.shopId = 1
    }
    console.log(this.shopId);
  },
  mixins: [],
  components: {
    headTop,
  },
  async mounted() {
    this.orderid = this.$route.params.orderid;
    let mealorder = await fetchql.query({
      operationName: '',
      query: 'query($id:Int!){ mealorder(id: $id) { id transactioncode code mealcode customertotal supplier { id name } customer { id openid nickname headimgurl } mealorderdetail { quantity dish { id name } dishattr { id name price } } } }',
      variables: {
        id: this.$route.params.orderid
      }
    })
    this.mealorder = mealorder.data.mealorder[0]
    console.log(mealorder);
  },
}
</script>
