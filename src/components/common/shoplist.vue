<template>
	<div class="shoplist_container">
		<ul v-load-more="loaderMore" v-if="shopListArr.length" type="1">
			<router-link :to="{path: 'shop', query:{geohash, id: item.id}}" v-for="item in shopListArr" tag='li' :key="item.id" class="shop_li">
				<div class="supplier">
					<div class="logo">
						<img src="../../images/supplier.jpg" alt="">
						<svg class="stars">
							<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#location"></use>
						</svg>
						<div class="starscount">
							32
						</div>
					</div>
					<div class="detail">
						<div class="left">
							<div class="name">
								麻辣面对面(北京-潘家园店)
							</div>
							<div class="address">
								北京市北京市朝阳区潘家园东路12号
							</div>
						</div>
						<div class="right">
							<div class="activity">
								+
							</div>
							<div class="distance">
								<svg class="grey_fill">
					                <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#location"></use>
					            </svg> 1.9km
							</div>
						</div>
					</div>
				</div>
			</router-link>
		</ul>
		<ul v-else class="animation_opactiy">
			<li class="list_back_li" v-for="item in 10" :key="item">
				<img src="../../images/shopback.svg" class="list_back_svg">
			</li>
		</ul>
		<p v-if="touchend" class="empty_data">没有更多了</p>
		<aside class="return_top" @click="backTop" v-if="showBackStatus">
			<svg class="back_top_svg">
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backtop"></use>
			</svg>
		</aside>
		<div ref="abc" style="background-color: red;"></div>
		<transition name="loading">
			<loading v-show="showLoading"></loading>
		</transition>
	</div>
</template>

<script>

import {mapState} from 'vuex'
import {shopList} from 'src/service/getData'
import {imgBaseUrl} from 'src/config/env'
import {showBack, animate} from 'src/config/mUtils'
import {loadMore, getImgPath} from './mixin'
import loading from './loading'
import ratingStar from './ratingStar'

export default {
	data(){
		return {
			offset: 0, // 批次加载店铺列表，每次加载20个 limit = 20
			shopListArr:[], // 店铺列表数据
			preventRepeatReuqest: false, //到达底部加载数据，防止重复加载
			showBackStatus: false, //显示返回顶部按钮
			showLoading: true, //显示加载动画
			touchend: false, //没有更多数据
			imgBaseUrl,
		}
	},
	mounted(){
		this.initData();
	},
	components: {
		loading,
		ratingStar,
	},
	props: ['restaurantCategoryId', 'restaurantCategoryIds', 'sortByType', 'deliveryMode', 'supportIds', 'confirmSelect', 'geohash'],
	mixins: [loadMore, getImgPath],
	computed: {
		...mapState([
			'latitude','longitude'
		]),
	},
	updated(){
		// console.log(this.supportIds, this.sortByType)
	},
	methods: {
		async initData(){
			//获取数据
			let res = await shopList(this.latitude, this.longitude, this.offset, this.restaurantCategoryId);
			this.shopListArr = [...res];
			if (res.length < 20) {
				this.touchend = true;
			}
			this.hideLoading();
			//开始监听scrollTop的值，达到一定程度后显示返回顶部按钮
			showBack(status => {
				this.showBackStatus = status;
			});
		},
		//到达底部加载更多数据
		async loaderMore(){
			if (this.touchend) {
				return
			}
			//防止重复请求
			if (this.preventRepeatReuqest) {
				return
			}
			this.showLoading = true;
			this.preventRepeatReuqest = true;

			//数据的定位加20位
			this.offset += 20;
			let res = await shopList(this.latitude, this.longitude, this.offset, this.restaurantCategoryId);
			this.hideLoading();
			this.shopListArr = [...this.shopListArr, ...res];
			//当获取数据小于20，说明没有更多数据，不需要再次请求数据
			if (res.length < 20) {
				this.touchend = true;
				return
			}
			this.preventRepeatReuqest = false;
		},
		//返回顶部
		backTop(){
			animate(document.body, {scrollTop: '0'}, 400,'ease-out');
		},
		//监听父级传来的数据发生变化时，触发此函数重新根据属性值获取数据
		async listenPropChange(){
			this.showLoading = true;
			this.offset = 0;
			let res = await shopList(this.latitude, this.longitude, this.offset, '', this.restaurantCategoryIds, this.sortByType, this.deliveryMode, this.supportIds);
			this.hideLoading();
			//考虑到本地模拟数据是引用类型，所以返回一个新的数组
			this.shopListArr = [...res];
		},
		//开发环境与编译环境loading隐藏方式不同
		hideLoading(){
			this.showLoading = false;
		},
		zhunshi(supports){
			let zhunStatus;
			if ((supports instanceof Array) && supports.length) {
 				supports.forEach(item => {
 					if (item.icon_name === '准') {
 						zhunStatus = true;
 					}
 				})
			}else{
				zhunStatus = false;
			}
			return zhunStatus
		},
	},
	watch: {
		//监听父级传来的restaurantCategoryIds，当值发生变化的时候重新获取餐馆数据，作用于排序和筛选
		restaurantCategoryIds: function (value){
			this.listenPropChange();
		},
		//监听父级传来的排序方式
		sortByType: function (value){
			this.listenPropChange();
		},
		//监听父级的确认按钮是否被点击，并且返回一个自定义事件通知父级，已经接收到数据，此时父级才可以清除已选状态
		confirmSelect: function (value){
			this.listenPropChange();
			this.$emit('DidConfrim');
		}
	}
}
</script>

<style lang="scss" scoped>
	@import 'src/style/mixin';
	.shoplist_container{
		background-color: #f8f8f8;
		margin-bottom: 2rem;
		padding: .5rem;
	}
	.supplier{
		display: flex;
		flex-direction: column;
		background-color: #fff;
		margin-bottom: .8rem;
		border: 1px solid #efefef;
		width: 100%;
		.logo{
			flex:1;
			height: 120px;
			overflow: hidden;
			position: relative;
			.stars{
				position: absolute;
				right: 30px;
				top: 10px;
				@include wh(.8rem, .8rem);
				fill: #eee;
				z-index: 100;
			}
			.starscount{
				color: #eee;
				font-size: 12px;
				position: absolute;
				right: 10px;
				top: 10px;
				@include wh(.8rem, .8rem);
				fill: $blue;
				z-index: 100;
			}
		}
		.detail{
			height: 65px;
			line-height: 20px;
			display: flex;
			padding: .5rem;
			flex-direction: row;
			.left{
				flex:1;
				.name{
					color: #333;
					font-weight: 300;
					font-size: 15px;
				}
				.address{
					color: #666;
					font-weight: 300;
					font-size: 12px;
				}

			}
			.right{
				width:3rem;
				text-align:right;
				.activity{
					min-height: 10px;
					font-size: 14px;
				}
				.distance{
					font-size: 12px;
					.grey_fill{
						@include wh(.8rem, .8rem);
		                fill: $blue;
					}
				}
			}
		}
	}

	.list_back_li{
		height: 4.85rem;
		.list_back_svg{
			@include wh(100%, 100%)
		}
	}
	.loader_more{
		@include font(0.6rem, 3);
		text-align: center;
	    color: #999;
	}
	.empty_data{
		@include sc(0.5rem, #666);
		text-align: center;
		line-height: 2rem;
	}
	.return_top{
		position: fixed;
		bottom: 3rem;
		right: 1rem;
		.back_top_svg{
			@include wh(2rem, 2rem);
		}
	}
	.loading-enter-active, .loading-leave-active {
		transition: opacity 1s
	}
	.loading-enter, .loading-leave-active {
		opacity: 0
	}
</style>
