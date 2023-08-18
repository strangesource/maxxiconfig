const { createApp } = Vue;

createApp({
    data() {
        return {
            selected: '1',
            strings: [
                []
            ],
            errors: ['Noch nicht geprüft.']
        }

    },
    computed: {
        sumWatt() {
            let sumWatt = 0;
            for (let i = 0; i < this.strings.length; i++) {
                if (this.strings[i].length == 0) continue;
                for (let j = 0; j < this.strings[i].length; j++) {
                    sumWatt += this.strings[i][j].watt;
                }
            }
            return sumWatt;
        }
    },
    methods: {
        addPanel(stringIndex) {
            this.strings[stringIndex].push({
                voltIdle: 0,
                voltWork: 0,
                watt: 0
            })
        },
        check() {
            this.errors = [];
            // check values per string
            let stringSums = [];
            for (let i = 0; i < this.strings.length; i++) {
                if (this.strings[i].length == 0) continue;
                let sumVoltageIdle = 0;
                let sumVoltageWork = 0;
                let sumWatt = 0;
                for (let j = 0; j < this.strings[i].length; j++) {
                    sumVoltageIdle += this.strings[i][j].voltIdle;
                    sumVoltageWork += this.strings[i][j].voltWork;
                    sumWatt += this.strings[i][j].watt;
                }

                stringSums.push(
                    {
                        sumVoltageIdle: sumVoltageIdle,
                        sumVoltageWork: sumVoltageWork,
                        sumWatt: sumWatt
                    }
                );

                if (sumVoltageWork < 60) {
                    this.errors.push("Nicht genug Arbeitsspannung an String " + (i + 1) + ": " + sumVoltageWork + " Volt. (< 60 Volt)");
                }

                if (sumVoltageIdle > 150) {
                    this.errors.push("Zu hohe Lehrlaufspannung  an String " + (i + 1) + ": " + sumVoltageIdle + " Volt. (> 150 Volt)");
                }

                if (sumWatt > 1000) {
                    this.errors.push("Zu hohe elektrische Leistung  an String " + (i + 1) + ": " + sumWatt + " Wp. (> 1000 Wp)");
                }
            }
            if (!stringSums.every(checkEqual)) {
                this.errors.push("Bei dem Maxxicharge 2.5 und 5.0 Speicher müssen die einzelnen Strings immer dieselbe Spannung aufweisen.");
            }
            function checkEqual(sum) {
                return sum.sumVoltageIdle == stringSums[0].sumVoltageIdle && sum.sumVoltageWork == stringSums[0].sumVoltageWork && sum.sumWatt == stringSums[0].sumWatt;
            }
        }
    },
    watch: {
        selected(newSelection, oldSelection) {
            if (newSelection == 1) {
                this.strings = [this.strings[0]]
            }
            if (newSelection == 2) {
                this.strings = [this.strings[0], (this.strings.length >= 2) ? this.strings[1] : []]
            }
            if (newSelection == 3) {
                this.strings = [this.strings[0], (this.strings.length >= 2) ? this.strings[1] : [],
                []
                ]
            }
        },
        strings: {
            handler(newStrings, oldStrings) {
                this.check()
            },
            deep: true //check on any change
        }
    }

}).mount('#app')