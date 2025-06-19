import React, { useState } from "react";
import { uploadFile } from "../../utils/upload";

function UploadComponent() {
  const [url, setUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const uploadedUrl = await uploadFile(file, "images");
    setUrl(uploadedUrl);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {url && (
        <div>
          <p>Uploaded file URL:</p>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </div>
      )}
    </div>
  );
}

export default UploadComponent;
