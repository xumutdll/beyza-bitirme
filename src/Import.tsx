import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Import: React.FC = () => {
  const navigate = useNavigate();

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      window.electron.ipcRenderer.send(
        "file-path",
        event.dataTransfer.files[0].path
      );
      navigate("/filter");

      // Optionally, send the file path to your backend here or handle it as needed
    }
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  return (
    <div
      className="h-screen flex justify-center items-center bg-gray-100 text-gray-800 text-4xl font-bold"
      //  className="h-screen flex justify-center items-center bg-gray-100 text-gray-800 text-4xl font-bold"
      // className="h-screen flex justify-center items-center bg-gray-900 text-blue-400 text-4xl font-bold"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      Başlamak için dosyayı buraya sürükleyin.
    </div>
  );
};

export default Import;
