var buttons, item;
{
    let doc = document
        , t = doc.createElement("style");
    t.id = "inventory2-market-sell",
        t.append(doc.createTextNode(".Inventory2MarketSell{width:500px}.Inventory2MarketSell .PrettyPopup-title{position:relative}.Inventory2MarketSell .PrettyPopup-title .item{position:absolute;width:85px;height:85px;right:0;-webkit-transform:translateY(5px);-ms-transform:translateY(5px);transform:translateY(5px)}.Inventory2MarketSell .PrettyPopup-desc{padding-right:100px}")),
        doc.head.append(t)
}
const { vex: vuetools } = require("/js/libs/vue-tools.js")
    , { get: lodash } = require('//dogecdn.wtf/libs/rollup/lodash/4.17.21-0049ef8d/lodash.umd.min.js')
    , { dialog: dialog, components: o } = require('/js/dialog.js')
    , { defaultValue: l } = require('/js/libs/utils/fns.js')
    , a = null !== (buttons = require("/js/vuem/DialogButtons.js").default) && void 0 !== buttons ? buttons : require("/js/vuem/DialogButtons.js")
    , ite = null !== (item = require("/js/vuem/Item.js").default) && void 0 !== item ? item : require("/js/vuem/Item.js")
    , tofloatfix2 = e => Number.parseFloat(e.toFixed(2));
exports.default = {
    components: {
        DialogButtons: a,
        "dialog-close": o["dialog-close"],
        Item: ite
    },
    props: {
        item: Object
    },
    data: () => ({
        MARKET_COMISSION: .15,
        is_buttons_processing: !1,
        price_best: null,
        price_best_souvenir: !1,
        price_new: {
            total: null,
            receive: null
        },
        first: false,
        min_sell_limit_warn: 0.99, // предупреждение.. если демпингуем. кнопка красным.
        min_sell_limit: 0.7, // ограничение чтобы была неактивна кнопка продать если ниже тек.цена*min_sell_limit
        prices: null
    }),
    computed: {
        item_id() {
            return l(this.item.item_id, this.item.thing_id)
        },
        item_proto_id() {
            return l(this.item.item_proto_id, this.item.thing_prototype_id)
        },
        disableEnter() {
            return this.price_new.total < ((this.price_best - this.price_best * this.min_sell_limit) >= 0.01 ? this.price_best * this.min_sell_limit : this.price_best - 0.01) || this.price_new.total > 15e3
        },
        button_color() {
            return this.price_new.total < ((this.price_best - this.price_best * this.min_sell_limit_warn) >= 0.01 ? this.price_best * this.min_sell_limit_warn : this.price_best - 0.01) ? "red" : "grass"
        },
        buttons() {
            return [{
                is_disabled: this.disableEnter,
                title: "Выставить на продажу",
                color: this.button_color,
                // color: "grass",
                emit: "sell"
            }]
        },
        last(){
            // if (typeof(JSON.parse(localStorage.lastsellprice)) == 'object')
            try {
                return JSON.parse(localStorage.lastsellprice)[this.item_proto_id] || -1
            } catch (error) {
                return 0
            }
        }
    },
    watch: {
        "price_new.total"(e) {
            if (document.activeElement !== this.$refs.price_new_receive)
                if (e = Number.parseFloat(e),
                    Number.isNaN(e))
                    this.price_new.receive = 0;
                else if (e > 0) {
                    const t = Math.max(Math.floor(100 * e * .15), 1);
                    this.price_new.receive = tofloatfix2(e - t / 100)
                } else
                    this.price_new.receive = 0
        },
        "price_new.receive"(e) {
            if (document.activeElement !== this.$refs.price_new_total)
                if (e = Number.parseFloat(e),
                    Number.isNaN(e))
                    this.price_new.total = 0;
                else if (e > 0) {
                    const t = Math.max(Math.floor(100 * e / (1 / .15 - 1)), 1);
                    this.price_new.total = tofloatfix2(e + t / 100)
                } else
                    this.price_new.total = 0
        }
    },
    created() {
        this.loadBestPrice(),
            "string" == typeof this.item.souvenir && this.loadBestPriceSouvenir()
    },
    async mounted() {
        this.price_new.total = 0,
            this.price_new.receive = 0,
            await this.$nextTick(),
            this.$refs.price_new_total.focus()
    },
    methods: {
        enterPressed(e) {
            this.price_new.total = tofloatfix2(this.price_new.total);
            // if (this.price_new.total.starts )
            if (e.keyCode === 13 && !this.disableEnter) {
                this.sell();
            }
        },
        async loadBestPriceOrig() {
            this.price_best = null;
            const e = await API.callMethod("market.getBestPrice", {
                thing_prototype_id: this.item_proto_id
            });
            0 === e.code && (this.price_best = l(e.data.price, -1), this.price_new.total = tofloatfix2(this.price_best - 0.01))
            
            await this.$nextTick(),
            this.$refs.price_new_total.select();
        },
        async loadBestPrice() {
            this.price_best = null;
            this.first = null;
            const e = await API.callMethod("market.getListing", {
                thing_prototype_id: this.item_proto_id,
                offset: 0,
                count: 50
            });
            // 0 === e.code && (this.price_best = l(e.data.price, -1), this.price_new.total = tofloatfix2(this.price_best - 0.01))
            if (0 === e.code)  {
                this.prices = e.data.things,
                this.price_best = l(e.data.things[0].price, -1),
                (e.data.things[0].user_id == API.user.user_id && (this.first = true))

                if (this.last > this.price_best) this.price_new.total = this.last;
                else this.price_new.total = tofloatfix2(this.price_best - (this.first ? 0 : 0.01))

            } else this.price_new.total = this.last
                
                await this.$nextTick(),
                this.$refs.price_new_total.select();
            },
        current() {
            this.price_new.total = tofloatfix2(this.price_best - (this.first ? 0 : 0.01));
        },
        setprice(p) {
            // console.log('p='+p);
            this.price_new.total =p.toFixed(2);
        },
        lastpriceset() {
            this.price_new.total = this.last;
        },
        async loadBestPriceSouvenir() {
            this.price_best_souvenir = null;
            const e = await API.callMethod("market.getListing", {
                thing_prototype_id: this.item_proto_id,
                offset: 0,
                count: 1,
                souvenir: 1
            });
            0 === e.code && (this.price_best_souvenir = l(lodash(e.data, "things[0].price"), -1))
        },
        onPriceInput(e, t) {
            const { target: targett, data: datta } = e;
            if ("string" == typeof datta && targett.selectionStart === targett.selectionEnd) {
                t = String(t),
                    "." === datta || "," === datta ? (t.includes(".") && e.preventDefault(),
                        "," === datta && (document.execCommand("insertText", !1, "."),
                            e.preventDefault())) : !0 !== /\d/.test(datta) && e.preventDefault();
                const i = String(t).split(".")[1];
                i && i.length >= 2 && e.preventDefault()
            }
        },
        async sell() {
            this.is_buttons_processing = !0;
            let lastprices = this.last ? JSON.parse(localStorage.lastsellprice) : {};
            lastprices[this.item_proto_id] = this.price_new.total
            localStorage.lastsellprice = JSON.stringify(lastprices);
            const e = await API.call("market.sell", {
                thing_id: this.item_id,
                price: this.price_new.total
            });
            switch (e.code) {
                case 0:
                    dialog({
                        text: [`Предмет успешно выставлен на продажу на {link:/market/thing/${this.item_proto_id};Маркет}.`, "Он пока будет недоступен в Вашем инвентаре.",`{link:#;${this.item.title}} за {link:#;${this.price_new.total}} руб. Получим: {link:#;${this.price_new.receive}} руб.`]
                    }),
                        this.$emit("return", !0);
                    break;
                case 191:
                    API.dialogs.emailNotVerified("Предмет не выставлен на Маркет.", "Вы не можете продавать предметы");
                    break;
                default:
                    API.dialogs.unknownError(e.code)
            }
        }
    }
};
let p = exports.default;
p.template = vuetools("<div class='Inventory2MarketSell PrettyPopup'>    <dialog-close></dialog-close>    <div class=PrettyPopup-title>Продажа на Маркете        <a :href='&#39;/market/thing/&#39; + item_proto_id'>            <item :item=item :size=75 appearance=micro></item>        </a>    </div>    <div class=PrettyPopup-desc>        <div>Вы можете выставить предмет на <a href=/market>Маркет</a>, где его смогут купить другие игроки. Пока            предмет будет находиться на Маркете, он не будет виден инвентаре.</div>    </div>    <form @submit.prevent class=form2-horizontal>        <div class='container form2-row'>            <div class=col-7>                <label class=form2-label>Текущая цена:</label>                <span style='color: green' v-if='first'> Мы первые!</span>            </div>            <div class='col-5 form2-static' :class='{processing:null==price_best}'>                    <i v-if='-1 == price_best'>нет в продаже</i>                    <a v-else v-on:click=current href='#'><span>от <b> {{ price_best }} р.</b></span></a> -                     <a v-if='last>0' v-on:click=lastpriceset href='#'><span>посл. <b> {{ last }} р.</b></span></a>            </div>        </div>        <div class='container form2-row' v-if='false!=price_best_souvenir'>            <div class=col-7><label class=form2-label>Текущая цена (сувенир):</label>        </div>        <div class='col-5 form2-static' :class='{processing:null==price_best_souvenir}'>                <i v-if='-1 == price_best_souvenir'>нет в продаже</i>                 <span v-else>от {{ price_best_souvenir }} р.</span></div>        </div>        <div class='container form2-row'>            <div class=col-7><label class=form2-label>Цена для покупателя:</label></div>            <div class=col-5>                <div class=input-group><input @beforeinput=onPriceInput($event,price_new.total) autocomplete=off                        class=form-input ref=price_new_total type=text v-model=price_new.total                        v-on:keydown=enterPressed> <span class=input-group-label>р.</span></div>            </div>        </div>        <div class='container form2-row'>            <div class=col-7><label class=form2-label>Вы получите:</label></div>            <div class=col-5>                <div class=input-group><input @beforeinput=onPriceInput($event,price_new.receive) autocomplete=off                        class=form-input ref=price_new_receive type=text v-model=price_new.receive> <span                        class=input-group-label>р.</span></div>            </div>        </div>    </form>  <dialog-buttons :buttons=buttons :is_buttons_processing=is_buttons_processing @sell=sell ref=buttons></dialog-buttons>       <div v-for='data of prices'>    <span v-if='data.user_id == API.user.user_id'><a  v-on:click='setprice(data.price)' href='#' style='color: red' > {{ data.price }}</a > - наша цена        </span><span v-else><a v-on:click='setprice(data.price - 0.01)' href='#' > {{ data.price }}</a > - {{ data.user_id }}</span></div ></div>"),
    exports.default = require("//cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js").component("inventory2-market-sell", p);
