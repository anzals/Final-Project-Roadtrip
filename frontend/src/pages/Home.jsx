import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Trip from "../components/Trip"
import Header from "../components/Header" 
import Footer from "../components/Footer" 

import "../styles/Home.css"

function Home({ trips, getTrips }) {

    useEffect(() => {
        getTrips();
    }, [getTrips]);

    const deleteTrip = (id) => {
        api
            .delete(`/api/trips/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Trip deleted!");
                else alert("Failed to delete trip.");
                getTrips();
            })
            .catch((error) => alert(error));
    };


    return (
        <div>
            <Header />
            <div className="home-content">
                <div className="title-container">
                        <span className="introduction-text">Welcome back, Jane!</span>
                        <p className="adventure-tag">Ready for your next adventure?</p>
                        <Link to="/plan-trip">
                        <button className="plan-trip-button">
                            + Plan a Trip
                        </button>
                        </Link>
                </div>

                <div className="planner">
                    <span className="my-trips">My Trips</span>
                    <div className="trip-container">
                    {trips.length > 0 ? (
                                        trips.map((trip) => (
                                        <Trip trip={trip} key={trip.id} onDelete={deleteTrip}/>
                                    ))
                                ) : (
                                <p className="">No trips yet. Start planning your adventure!</p>
                                )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
        );
    }
    
export default Home