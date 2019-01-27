var READ_KEY = 'read'

firebase.initializeApp({
    apiKey: "AIzaSyB7opQS4JAFI5j6DilDJaiMWGH5P524Npg",
    databaseURL: "https://biblereading.firebaseio.com",
    projectId: "firebase-biblereading",
    storageBucket: "firebase-biblereading.appspot.com",
});

var app = new Vue({
    el: '#app',
    data: {
        bible: {},
        OTCount: 929,
        NTCount: 260,
        readAmount: ''
    },
    computed: {
        totalCount() {
            return this.OTCount + this.NTCount
        },
        guidHash() {
            return location.hash.substring(1)
        },
    },
    mounted(){
        if(location.hash == '') { location.hash = this.guid() }
        fetch('bible.json').then(r => r.json()).then((json) => {
            this.bible = json
            this.loadSaved()
        })
    },
    methods: {
        guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        markRead(element) {
            element.target.classList.toggle(READ_KEY)
            this.saveRead(element);
            this.updateReadAmount()
        },
        saveRead(element) {
            var chapter = element.target.dataset.chapter
            var book = element.target.dataset.book
            var id = String(book) + String(chapter)
            var read = firebase.database().ref(this.guidHash + '/' + book + '/' + chapter + '/');
            if (element.target.classList.contains(READ_KEY)) {
                read.set({ read: 1 });
            } else {
                read.set({})
            }
        },
        loadSaved() {
            if(!this.guidHash) { throw new Error("URL Hash not set!") }
            
            var ref = firebase.database().ref(this.guidHash);
            ref.on("value", (snapshot) => {
                var data = snapshot.val()
                for (var book in data) {
                    if (data.hasOwnProperty(book)) {
                        for (var chapter in data[book]) {
                            if (data[book].hasOwnProperty(chapter)) {
                                var matches = document.querySelectorAll(`[data-book='${book}'][data-chapter='${chapter}']`);
                                if(matches.length) { matches[0].classList.add(READ_KEY) }
                            }
                        }
                    }
                }
                this.updateReadAmount()
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code)
            });
        },
        updateReadAmount() {
            var totalRead = ((document.getElementsByClassName(READ_KEY).length / this.totalCount) * 100)
            this.readAmount = (totalRead < 100 && totalRead > 0) ? "(You have read " + totalRead.toPrecision(2) + "% of the Bible.)" : ''
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