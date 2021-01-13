class PointSource {
    constructor(amplitude,phase,frequency,position,type,orientation){
        this.amplitude = amplitude;
        this.phase = phase;
        this.frequency = frequency;
        this.position = position;
        this.speedOfSound = 340;
        this.customDirectivity = {
            theta: [],
            weight: []
        };
        this.type = type;
        this.orientation = orientation;
    }

    value(x,y,t){
        let r = dist(this.position.x,this.position.y,x,y);
        let value;
        let directivity = this.computeDirectivityWeight(x-this.position.x,y-this.position.y);
        if (r > 0) {
            value = directivity*this.amplitude*cos(2*Math.PI*this.frequency*(t - r/this.speedOfSound) + this.phase)/r;
        } else {
            value = this.amplitude;
        }
        return value;
    }

    computeDirectivityWeight(x,y){
        let theta = Math.atan2(y,x) + this.orientation;
        switch(this.type) {
            case "monopole":
                return 1.0;
            case "dipole":
                return 2*Math.cos(theta);
            case "quadrupole":
                return 4*Math.cos(theta)*Math.sin(theta);
            case "octopole":
                return 8*(Math.cos(theta)*Math.cos(theta + PI/4))*(Math.sin(theta)*Math.sin(theta + PI/4));
            case "custom":
                if(!this.customDirectivity.length)
                    console.log("the custom directivity array is empty")
                return this.customDirectivity;
                
        }

    }


}