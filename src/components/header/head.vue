<template>
    <header id='head_top'>
        <section class="head_goback" v-if="goBack" @click="$router.go(-1)">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" version="1.1">
                <polyline points="12,18 4,9 12,0" style="fill:none;stroke:rgb(100,100,100);stroke-width:2"/>
            </svg>
        </section>
        <!-- <router-link to="/profile" class="head_login">
            <span class="login_span">我的</span>
        </router-link> -->
        <section class="title_head ellipsis" v-if="headTitle">
            <span class="title_text">{{headTitle}}</span>
        </section>
    </header>
</template>

<script>
    import {mapState, mapActions} from 'vuex'
    export default {
    	data(){
            return{

            }
        },
        mounted(){
            //获取用户信息
            // this.getUserInfo();

        },
        props: ['signinUp', 'headTitle', 'goBack'],
        computed: {
            // ...mapState([
            //     'userInfo'
            // ]),
        },
        methods: {
            // ...mapActions([
            //     'getUserInfo'
            // ]),
        },

    }

</script>

<style lang="scss" scoped>
    @import '../../style/mixin';

    #head_top{
        background-color: #fff;
        position: fixed;
        z-index: 200;
        left: 0;
        top: 0px;
        @include wh(100%, 2.4rem);
        border-bottom: 1px solid #efefef;
        background-color: #fefefe;
    }
    .head_goback{
        @include wh(1.2rem, 1.2rem);
        line-height: 3rem;
        margin-left: 1rem;
    }
    .title_head{
        @include center;
        width: 50%;
        text-align: center;
        .title_text{
            @include sc(1rem, #555);
            text-align: center;
        }
    }
</style>
