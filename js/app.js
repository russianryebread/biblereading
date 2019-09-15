const READ_KEY = 'read'
const BIBLE_JSON = 'js/bible.json'
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const TODAY = new Date().getDay()


firebase.initializeApp({
    apiKey: "AIzaSyB7opQS4JAFI5j6DilDJaiMWGH5P524Npg",
    databaseURL: "https://biblereading.firebaseio.com",
    projectId: "firebase-biblereading",
    storageBucket: "firebase-biblereading.appspot.com",
});

const app = new Vue({
    el: '#app',
    data: {
        bible: {},
        OTCount: 929,
        NTCount: 260,
        readCount: 0
    },
    computed: {
        totalCount() {
            return this.OTCount + this.NTCount
        },
        guidHash() {
            return location.hash.substring(1)
        },
        percentageRead() {
            let totalRead = ((this.readCount / this.totalCount) * 100)
            return (totalRead < 100 && totalRead > 0) ? "(You have read " + totalRead.toPrecision(2) + "% of the Bible.)" : ''
        },
    },
    mounted(){
        if(location.hash == '') { location.hash = this.guid() }
        fetch(BIBLE_JSON).then(r => r.json()).then((json) => {
            this.bible = json
            this.loadSaved()
        })
    },
    methods: {
        guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
                return v.toString(16)
            })
        },
        markRead(element) {
            element.target.classList.toggle(READ_KEY)
            this.saveRead(element)
        },
        saveRead(element) {
            let chapter = element.target.dataset.chapter
            let book = element.target.dataset.book
            let read = firebase.database().ref(`${this.guidHash}/${book}/${chapter}/`);
            if (element.target.classList.contains(READ_KEY)) {
                read.set({ read: DAYS[TODAY], date: new Date().toISOString() })
                this.readCount++
            } else {
                read.set({})
                this.readCount--
            }
        },
        loadSaved() {
            let ref = firebase.database().ref(this.guidHash)
            ref.on("value", (snapshot) => {
                let count = 0
                let data = snapshot.val()
                for (let book in data) {
                    if (data.hasOwnProperty(book)) {
                        for (let chapter in data[book]) {
                            if (data[book].hasOwnProperty(chapter)) {
                                let matches = document.querySelectorAll(`[data-book='${book}'][data-chapter='${chapter}']`)
                                if(matches.length) {
                                    matches[0].classList.add(READ_KEY, data[book][chapter].read)
                                    count++
                                }
                            }
                        }
                    }
                }
                this.readCount = count
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code)
            });
        },
    },
    filters: {
        lowercase(input) {
            return input.toLowerCase()
        },
        removespace(value) {
            return value.replace(/\s/g, '')
        }
    }
})