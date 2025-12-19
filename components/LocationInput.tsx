"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";

interface LocationInputProps {
    onLocationChange: (location: string) => void;
}

export default function LocationInput({ onLocationChange }: LocationInputProps) {
    const [location, setLocation] = useState("");
    const [isDetecting, setIsDetecting] = useState(false);

    const handleDetectLocation = () => {
        setIsDetecting(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );

                        if (!response.ok) {
                            throw new Error("Failed to fetch address");
                        }

                        const data = await response.json();

                        if (data && data.display_name) {
                            // Simplify address if possible (e.g., Road, City, Zip)
                            // The display_name is often very long, but good for accuracy.
                            // We can use the parts if available, otherwise fallback to display_name
                            const address = data.address;
                            let formattedAddress = data.display_name;

                            if (address) {
                                const parts = [
                                    address.road || address.house_number,
                                    address.suburb || address.neighbourhood,
                                    address.city || address.town || address.village,
                                    address.postcode
                                ].filter(Boolean);

                                if (parts.length >= 2) {
                                    formattedAddress = parts.join(", ");
                                }
                            }

                            setLocation(formattedAddress);
                            onLocationChange(formattedAddress);
                        } else {
                            setLocation(`${latitude}, ${longitude}`); // Fallback
                            onLocationChange(`${latitude}, ${longitude}`);
                        }
                    } catch (error) {
                        console.error("Geocoding error:", error);
                        // Fallback to coords if API fails
                        const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        setLocation(fallback);
                        onLocationChange(fallback);
                    } finally {
                        setIsDetecting(false);
                    }
                },
                (error) => {
                    console.error("Error detecting location:", error);
                    let errorMessage = "Could not detect location.";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access denied. Please enable permissions.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "The request to get user location timed out.";
                            break;
                    }
                    alert(errorMessage);
                    setIsDetecting(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setIsDetecting(false);
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation(e.target.value);
        onLocationChange(e.target.value);
    };

    return (
        <div className="relative">
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
                Your Location
            </label>
            <div className="relative flex rounded-md shadow-sm">
                <div className="relative flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        name="location"
                        id="location"
                        className="focus:ring-primary focus:border-primary block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-border border p-2.5"
                        placeholder="Enter your address or zip code"
                        value={location}
                        onChange={handleManualChange}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                    className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-border text-sm font-medium rounded-r-md text-muted-foreground bg-muted hover:bg-muted/80 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                    <Navigation className={`h-4 w-4 ${isDetecting ? "animate-spin" : ""}`} />
                    <span>{isDetecting ? "Detecting..." : "Detect"}</span>
                </button>
            </div>
        </div>
    );
}
