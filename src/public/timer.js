let arc = function (width) {
    return d3.svg.arc()
        .innerRadius(width / 2 - 10)
        .outerRadius(width / 2)
        .startAngle(0)
        .endAngle(d => -((d.value / d.size) * 2 * Math.PI))
};

class Timer {
    constructor(maxTime, timePassed, width, height, additionalClass, onEnd, autoUpdate, shouldPulse = function () { return false; }, ontick = function () {}) {
        this.maxTime = maxTime;
        this.width = width;
        this.height = height;
        this.timePassed = timePassed;
        this.timeLimit = maxTime;
        this.paused = true;
        this.started = false;
        this.onEnd = onEnd;
        this.autoUpdate = autoUpdate;
        this.shouldPulse = shouldPulse;
        this.ontick = ontick;
        this.updateInProgress = false;

        this.fields = [{
            value: this.timeLimit,
            size: this.timeLimit,
            update: () => this.timePassed += 1,
        }];

        this.svg = d3.select(".container").append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.field = this.svg.selectAll(".field")
            .data(this.fields)
            .enter().append("g")
            .attr("transform", `translate(${this.width / 2},${this.height / 2})`)
            .attr("class", "field");

        this.back = this.field.append("path")
            .attr("class", "path path--background")
            .attr("class", additionalClass + "--background")
            .attr("d", arc(this.width));

        this.path = this.field.append("path")
            .attr("class", "path path--foreground")
            .attr("class", additionalClass + "--foreground");

        this.label = this.field.append("text")
            .attr("class", "label")
            .attr("class", additionalClass + "--label")
            .attr("dy", ".35em");

        this.timerName = this.field.append("text")
            .attr("class", "label")
            .attr("class", additionalClass + "--name")
            .attr("dy", "2.15em");

        this.timerName.text(additionalClass);
        this.update()
    }

    update(suppressUpdate = false) {
        if (!this.started) {
            this.back.classed("paused", true);
            this.label.classed("paused", true);
            this.timerName.classed("paused", true);
            this.field.each(d => {
                d.previous = undefined;
                d.value = d.update(0);
            });
            this.label.text(this.timeLimit);
            return;
        }

        if (this.paused) {
            this.timerName.classed("paused", true);
            this.back.classed("paused", true);
            this.label.classed("paused", true);
            return;
        }

        if (!suppressUpdate) {
            this.field.each(d => {
                d.previous = d.value;
                d.value = d.update(Math.min(0, this.timePassed));
            });
        } else {
            this.field.each(d => {
                d.previous = d.value;
            });
        }

        if (this.updateInProgress) {
            return;
        }

        this.ontick();

        if (this.timePassed - 1 < this.timeLimit) {
            if (!this.paused) {
                this.back.classed("paused", false);
                this.label.classed("paused", false);
                this.timerName.classed("paused", false);
                if (this.autoUpdate) {
                    this.updateInProgress = true;
                    setTimeout(() => {
                        this.updateInProgress = false;
                        this.update();
                    }, 1000);
                }
            } else {
                this.timerName.classed("paused", false);
                this.back.classed("paused", true);
                this.label.classed("paused", true);
            }
        } else {
            this.onEnd();
        }

        this.path.transition()
            .ease("elastic")
            .duration(500)
            .attrTween("d", this.arcTween(this.width));

        if (this.shouldPulse()) {
            this.pulseText();
        } else {
            this.label.text(d => d.size - d.value);
            this.back.classed("pulse", false);
            this.label.classed("pulse", false);
            this.timerName.classed("paused", false);
        }
    }

    animate() {
        this.back.classed("paused", this.paused);
        this.label.classed("paused", this.paused);
        this.timerName.classed("paused", this.paused);
        this.path.transition()
            .ease("elastic")
            .duration(500)
            .attrTween("d", this.arcTween(this.width));

        if (this.shouldPulse()) {
            this.pulseText();
        } else {
            this.label.text(d => d.size - d.value);
            this.back.classed("pulse", false);
            this.label.classed("pulse", false);
        }
    }

    pulseText() {
        this.back.classed("pulse", true);
        this.label.classed("pulse", true);

        if ((this.timeLimit - this.timePassed) >= 0) {
            this.label.style("font-size", "120px")
                .attr("transform", "scale(" + 1.2 + ")")
                .text(d => d.size - d.value);
        }

        this.label.transition()
            .ease("elastic")
            .duration(900)
            .style("font-size", "90px")
            .attr("transform", "scale(" + 1.2 + ")");
    }

    arcTween(width) {
        return function (b) {
            var i = d3.interpolate({
                value: b.previous
            }, b);

            return t => arc(width)(i(t));
        }
    }

    getRemaningTime() {
        return this.maxTime - this.timePassed;
    }

    reset() {
        this.timeLimit = this.maxTime;
        this.timePassed = 0;
        this.paused = true;
        this.started = false;
        this.update();
        this.field.each(d => {
            d.previous = undefined;
        });
        this.path.transition()
            .ease("elastic")
            .duration(500)
            .attrTween("d", this.arcTween(this.width));
        return;
    }
}
