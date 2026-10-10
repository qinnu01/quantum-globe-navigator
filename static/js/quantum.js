export class QuantumState {
    constructor(theta = 0, phi = 0) {
        this.theta = theta; 
        this.phi = phi;     
    }

    toLatLon() {
        const lat = 90 - (this.theta * (180 / Math.PI));
        let lon = (this.phi * (180 / Math.PI)) - 180;
        if (lon > 180) lon -= 360;
        return { lat, lon };
    }

    static fromLatLon(lat, lon) {
        const theta = (90 - lat) * (Math.PI / 180);
        let phi = (lon + 180) * (Math.PI / 180);
        return new QuantumState(theta, phi);
    }
}