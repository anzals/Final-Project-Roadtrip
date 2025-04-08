import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../api";
import Header from "../components/Header";

function ReorderPitstops() {
    const { id } = useParams();
    const [pitstops, setPitstops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch existing pitstops
    useEffect(() => {
        async function fetchPitstops() {
            try {
                const response = await api.get(`/api/routes/${id}/`);
                let pitstopsData = response.data.pitstops;

                if (typeof pitstopsData === "string") {
                    try {
                        pitstopsData = JSON.parse(pitstopsData);
                    } catch (err) {
                        console.error("Error parsing pitstops:", err);
                        pitstopsData = [];
                    }
                }

                setPitstops(Array.isArray(pitstopsData) ? pitstopsData : []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching pitstops:", err);
                setLoading(false);
            }
        }

        fetchPitstops();
    }, [id]);

    // Handle drag and drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const updatedPitstops = Array.from(pitstops);
        const [movedItem] = updatedPitstops.splice(result.source.index, 1);
        updatedPitstops.splice(result.destination.index, 0, movedItem);

        setPitstops(updatedPitstops);
    };

    // Save reordered pitstops
    const saveReorderedPitstops = async () => {
        try {
            const response = await api.patch(`/api/routes/${id}/update/`, {
                pitstops: pitstops,  // Save the newly reordered pitstops
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
            });
    
            if (response.status === 200) {
                alert("Pitstops reordered successfully!");
                navigate(`/route/${id}/update-route`, { state: { reorderedPitstops: pitstops } });
            } else {
                alert("Failed to save reordered pitstops.");
            }
        } catch (error) {
            console.error("Error saving reordered pitstops:", error);
        }
    };
    

    

    // Cancel and go back
    const cancelReorder = () => {
        navigate(`/route/${id}/update-route`, { state: { reorderedPitstops: pitstops } });
    };

    if (loading) return <div>Loading pitstops...</div>;

    return (
        <div className="reorder-pitstops-page">
            <Header />
            <h2>Reorder Pitstops</h2>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pitstops">
                    {(provided) => (
                        <ul {...provided.droppableProps} ref={provided.innerRef}>
                            {pitstops.map((pitstop, index) => (
                                <Draggable key={pitstop} draggableId={pitstop} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="pitstop-item"
                                        >
                                            {pitstop}
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
            <div className="buttons">
                <button onClick={saveReorderedPitstops}>Save</button>
                <button onClick={cancelReorder}>Cancel</button>
            </div>
        </div>
    );
}

export default ReorderPitstops;
