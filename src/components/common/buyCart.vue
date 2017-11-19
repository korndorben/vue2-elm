 <template>
    <section class="cart_module">
        <section v-if="dish.specfoods.length<=1" class="cart_button">
            <transition name="showReduce">
                <svg v-if="foodNum" class="add_icon" @touchstart="removeOutCart(dish,dish.specfoods[0], $event)">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cart-minus"></use>
                </svg>
            </transition>
            <transition name="fade">
                <span class="cart_num" v-if="foodNum">{{foodNum}}</span>
            </transition>
            <svg class="add_icon" @touchstart="addToCart(dish,dish.specfoods[0] , $event)">
                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cart-add"></use>
            </svg>
        </section>
        <section v-else class="choose_specification">
            <section class="choose_icon_container">
                <transition name="showReduce">
                    <svg class="specs_reduce_icon" v-if="foodNum" @click="showReduceTip">
                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cart-minus"></use>
                    </svg>
                </transition>
                <transition name="fade">
                    <span class="cart_num" v-if="foodNum">{{foodNum}}</span>
                </transition>
                <span class="show_chooselist" @click="showChooseList(dish)">选规格</span>
            </section>
        </section>
    </section>
</template>

<script>
import {
  mapState,
  mapMutations
} from 'vuex'
export default {
  data() {
    return {
      showMoveDot: [], //控制下落的小圆点显示隐藏
    }
  },
  mounted() {

  },
  computed: {
    ...mapState([
      'cartList'
    ]),
    /**
     * 监听cartList变化，更新当前商铺的购物车信息shopCart，同时返回一个新的对象
     */
    shopCart: function() {
      return Object.assign({}, this.cartList[this.shopId]);
    },
    //shopCart变化的时候重新计算当前商品的数量
    foodNum: function() {
      let category_id = this.dish.dishcategoryid;
      let item_id = this.dish.id;
      if (this.shopCart && this.shopCart[category_id] && this.shopCart[category_id][item_id]) {
        let num = 0;
        Object.values(this.shopCart[category_id][item_id]).forEach((item, index) => {
          num += item.num;
        })
        return num;
      } else {
        return 0;
      }
    },
  },
  props: ['dish', 'shopId'],
  methods: {
    ...mapMutations([
      'ADD_CART', 'REDUCE_CART',
    ]),
    //移出购物车
    removeOutCart(dish, dishattr) {
      if (this.foodNum > 0) {
        this.REDUCE_CART({
          supplierid: dish.supplierid,
          dishcategoryid: dish.dishcategoryid,
          dishid: dish.id,
          dishname: dish.name,
          dishattrid: dishattr.id,
          dishattrname: dishattr.name,
          price: dishattr.price,
        });
      }
    },
    //加入购物车，计算按钮位置。
    addToCart(dish, dishattr, event) {
      this.ADD_CART({
        supplierid: dish.supplierid,
        dishcategoryid: dish.dishcategoryid,
        dishid: dish.id,
        dishname: dish.name,
        dishattrid: dishattr.id,
        dishattrname: dishattr.name,
        price: dishattr.price,
      });
      let elLeft = event.target.getBoundingClientRect().left;
      let elBottom = event.target.getBoundingClientRect().bottom;
      this.showMoveDot.push(true);
      this.$emit('showMoveDot', this.showMoveDot, elLeft, elBottom);

    },
    //显示规格列表
    showChooseList(foodScroll) {
      this.$emit('showChooseList', foodScroll)
    },
    //点击多规格商品的减按钮，弹出提示
    showReduceTip() {
      this.$emit('showReduceTip')
    },

  },
}
</script>

<style lang="scss" scoped>
@import '../../style/mixin';
.cart_module {
    .add_icon {
        position: relative;
        z-index: 999;
    }
    .cart_button {
        display: flex;
        align-items: center;
    }
    svg {
        @include wh(0.9rem, 0.9rem);
        fill: #3190e8;
    }
    .specs_reduce_icon {
        fill: #999;
    }
    .cart_num {
        @include sc(0.65rem, #666);
        min-width: 1rem;
        text-align: center;
        font-family: Helvetica Neue,Tahoma;
    }
    .choose_specification {
        .choose_icon_container {
            display: flex;
            align-items: center;
            .show_chooselist {
                display: block;
                @include sc(0.55rem, #fff);
                padding: 0.1rem 0.2rem;
                background-color: $blue;
                border-radius: 0.2rem;
                border: 1px solid $blue;
            }
        }
    }
}
.showReduce-enter-active,
.showReduce-leave-active {
    transition: all 0.3s ease-out;
}
.showReduce-enter,
.showReduce-leave-active {
    opacity: 0;
    transform: translateX(1rem);
}
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s;
}
.fade-enter,
.fade-leave-active {
    opacity: 0;
}
.fadeBounce-enter-active,
.fadeBounce-leave-active {
    transition: all 0.3s;
}
.fadeBounce-enter,
.fadeBounce-leave-active {
    opacity: 0;
    transform: scale(.7);
}
</style>
