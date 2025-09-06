export function setupPostureModal(intervalMin = 15) {
  // Remove existing modal if it exists
  const existingModal = document.getElementById("posture-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal element
  const modal = document.createElement("div");
  modal.id = "posture-modal";
  modal.className = "posture-modal hidden";
  modal.innerHTML = `
    <div class="posture-content">
      <i class='bx bx-spa'></i>
      <p>Posture Check! Please sit up straight and take a short stretch.</p>
      <button id="close-posture-modal">Okay</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Add styles for the modal
  const style = document.createElement("style");
  style.id = "posture-modal-styles";
  style.innerHTML = `
    .posture-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
    }
    
    .posture-modal.hidden {
      display: none;
    }
    
    .posture-content {
      background: white;
      color: black;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      max-width: 90%;
      max-width: 400px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }
    
    .posture-modal:not(.hidden) .posture-content {
      transform: scale(1);
    }
    
    .posture-content i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #7494ec;
      display: block;
    }
    
    .posture-content p {
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      line-height: 1.4;
    }
    
    .posture-content button {
      margin-top: 1rem;
      padding: 0.8rem 2rem;
      background: #7494ec;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: background 0.2s ease;
    }
    
    .posture-content button:hover {
      background: #5e7edb;
    }
    
    /* Dark mode styles */
    body.dark .posture-content {
      background: #1e1e1e;
      color: white;
      border: 1px solid #333;
    }
    
    body.dark .posture-modal {
      background: rgba(0, 0, 0, 0.7);
    }
  `;
  
  // Remove existing styles if they exist
  const existingStyles = document.getElementById("posture-modal-styles");
  if (existingStyles) {
    existingStyles.remove();
  }
  
  document.head.appendChild(style);

  // Set up event listeners
  const closeBtn = modal.querySelector("#close-posture-modal");
  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  // Close modal when clicking outside
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  };

  // Set up automatic posture reminders
  setInterval(() => {
    modal.classList.remove("hidden");
  }, intervalMin * 60 * 1000);

  // Set up test button if it exists
  const testButton = document.getElementById("test-posture-alert");
  if (testButton) {
    testButton.onclick = () => {
      modal.classList.remove("hidden");
    };
  }

  console.log(`Posture modal set up with ${intervalMin} minute intervals`);
}