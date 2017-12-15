/**
 * Created by yangchunrun on 17/3/2.
 */
import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions.js';
// import * as mutations from './mutations.js';
// import actions from './actions.js';
// import mutations from './mutations.js';

Vue.use(Vuex);

const state = {
    ws:{},
    socket: '',
    uid:window.User.id
};

export default new Vuex.Store({
    state,
    getters: {
        getsocket: state => state.socket
      },
    actions,
    mutations:{
        setsocket (state, data) {
            state.socket = data
          }
    }
});