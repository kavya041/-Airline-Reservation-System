const Flight = require('../models/Flight');

const searchFlights = async (req, res) => {
    try {
        const { source, destination, date } = req.query;
        let query = {};

        if (source) query.source = new RegExp(source, 'i');
        if (destination) query.destination = new RegExp(destination, 'i');
        // Simple search without date strict matching for sample data ease

        const flights = await Flight.find(query);

        // Seasonal Pricing Logic
        const currentMonth = new Date().getMonth();
        const isPeakSeason = [5, 6, 7, 11].includes(currentMonth);

        const applyPricing = (f) => {
            let adjustedPrice = f.basePrice;
            if (isPeakSeason) adjustedPrice = adjustedPrice * 1.2;
            else adjustedPrice = adjustedPrice * 0.9;
            return {
                ...f._doc,
                adjustedPrice: Math.round(adjustedPrice)
            };
        };

        let processedFlights = flights.map(applyPricing);

        // Basic Connecting Flight Logic (if no direct flights found or as additional options)
        if (source && destination) {
            const allFlights = await Flight.find({});
            const hubs = ['London', 'Dubai', 'Mumbai', 'Singapore', 'New York']; 
            
            hubs.forEach(hub => {
                if (hub.toLowerCase() === source.toLowerCase() || hub.toLowerCase() === destination.toLowerCase()) return;

                const leg1 = allFlights.find(f => 
                    new RegExp(source, 'i').test(f.source) && 
                    new RegExp(hub, 'i').test(f.destination)
                );
                const leg2 = allFlights.find(f => 
                    new RegExp(hub, 'i').test(f.source) && 
                    new RegExp(destination, 'i').test(f.destination)
                );

                if (leg1 && leg2) {
                    // Departure of leg2 must be after arrival of leg1
                    if (new Date(leg2.departureTime) > new Date(leg1.arrivalTime)) {
                        processedFlights.push({
                            _id: `${leg1._id}-${leg2._id}`,
                            airlineName: `${leg1.airlineName} + ${leg2.airlineName}`,
                            flightId: `${leg1.flightId} / ${leg2.flightId}`,
                            source: leg1.source,
                            destination: leg2.destination,
                            departureTime: leg1.departureTime,
                            arrivalTime: leg2.arrivalTime,
                            basePrice: leg1.basePrice + leg2.basePrice,
                            adjustedPrice: applyPricing(leg1).adjustedPrice + applyPricing(leg2).adjustedPrice,
                            seatsAvailable: Math.min(leg1.seatsAvailable, leg2.seatsAvailable),
                            isConnecting: true,
                            hub: hub
                        });
                    }
                }
            });
        }

        res.json(processedFlights);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { searchFlights };
