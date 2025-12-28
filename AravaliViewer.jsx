import React, { useEffect, useRef } from "react";
import { Viewer } from "resium";
import { Cartesian3 } from "cesium";

function AravaliViewer({ data }) {
  const viewerRef = useRef(null);

  
  useEffect(() => {
    if (data?.coordinates && viewerRef.current) {
      const { lat, lng } = data.coordinates;
      
      
      viewerRef.current.cesiumElement.camera.flyTo({
        destination: Cartesian3.fromDegrees(lng, lat, 10000),
      });
    }
  }, [data]);

  return (
    <Viewer 
      full 
      ref={viewerRef}
      style={{ width: '100%', height: '100%' }}
      timeline={false} 
      animation={false}
  
      geocoder={true} 
    />
  );
}

export default AravaliViewer;