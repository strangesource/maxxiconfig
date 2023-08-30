const { createApp } = Vue;

const MAX_VOLTAGE_IDLE = 138;
const MIN_VOLTAGE_WORK = 60;
const MAX_POWER_PER_STRING = 1000;


createApp({
    data() {
        return {
            selected: '1',
            strings: [
                []
            ],
            errors: ['Noch nicht geprüft.'],
            warnings: []
        }

    },
    computed: {
        overallWatt() {
            let sum = 0;
            for (let i = 0; i < this.strings.length; i++) {
                if (this.strings[i].length == 0) continue;
                for (let j = 0; j < this.strings[i].length; j++) {
                    sum += this.strings[i][j].watt;
                }
            }
            return sum;
        },
        uniqueWarnings() {
            return [...new Set(this.warnings)];
        },
        uniqueErrors() {
            return [...new Set(this.errors)];
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
        removePanel(stringIndex, panelIndex) {
            this.strings[stringIndex].splice(panelIndex, 1);
        },
        duplicatePanel(stringIndex, panelIndex) {
            this.strings[stringIndex].splice(panelIndex, 0, JSON.parse(JSON.stringify(this.strings[stringIndex][panelIndex])));
        },
        sumWatt(stringIndex) {
            let sum = 0;
            for (let j = 0; j < this.strings[stringIndex].length; j++) {
                sum += this.strings[stringIndex][j].watt;
            }

            return sum;
        },
        sumVoltageIdle(stringIndex) {
            let sum = 0;
            console.log(stringIndex);
            for (let j = 0; j < this.strings[stringIndex].length; j++) {
                sum += this.strings[stringIndex][j].voltIdle;
            }
            return sum;
        },
        sumVoltageWork(stringIndex) {
            let sum = 0;
            for (let j = 0; j < this.strings[stringIndex].length; j++) {
                sum += this.strings[stringIndex][j].voltWork;
            }
            return sum;
        },
        check() {
            this.errors = [];
            this.warnings = [];
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
                    for (let k = j; k < this.strings[i].length; k++) {
                        if (j == k) continue;
                        if (this.strings[i][j].voltIdle != this.strings[i][k].voltIdle ||
                            this.strings[i][j].voltWork != this.strings[i][k].voltWork ||
                            this.strings[i][j].watt != this.strings[i][k].watt) {
                            this.warnings.push("Die Werte der Module in String " + (i + 1) + " sollten innerhalb des String identisch sein. Abweichungen können zu Leistungsverlusten führen.");
                        }
                    }
                }

                stringSums.push(
                    {
                        sumVoltageIdle: sumVoltageIdle,
                        sumVoltageWork: sumVoltageWork,
                        sumWatt: sumWatt
                    }
                );

                if (sumVoltageWork < MIN_VOLTAGE_WORK) {
                    this.errors.push("Nicht genug Arbeitsspannung an String " + (i + 1) + ": " + sumVoltageWork + " Volt. (< " + MIN_VOLTAGE_WORK + " Volt)");
                }

                if (sumVoltageIdle > MAX_VOLTAGE_IDLE) {
                    this.errors.push("Zu hohe Lehrlaufspannung  an String " + (i + 1) + ": " + sumVoltageIdle + " Volt. (> " + MAX_VOLTAGE_IDLE + " Volt)");
                }

                if (sumWatt > MAX_POWER_PER_STRING) {
                    this.errors.push("Zu hohe elektrische Leistung an String " + (i + 1) + ": " + sumWatt + " Wp. (> " + MAX_POWER_PER_STRING + " Wp)");
                }
            }
            if (!stringSums.every(checkEqual)) {
                this.warnings.push("Bei dem Maxxicharge 2.5 und 5.0 Speicher sollten die einzelnen Strings immer dieselbe Spannung aufweisen um Leistungsverluste zu vermeiden. (<a href=\"https://www.maxxisun.de/post/welche-solarmodule-kann-ich-an-maxxicharge-anschlie%C3%9Fen?commentId=44329006-f6b6-4aef-9b55-1de2b06c8ba3\">Quelle</a>)");
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