## 🛠 Configuration Tool: Parking Space Picker (`parkingSpace.py`)

Before running the main detection system, the parking spots must be defined manually using this utility script. It allows the user to draw Regions of Interest (ROIs) on a reference image of the parking lot.

### 🎮 Controls

| Interaction | Action | Description |
| :--- | :--- | :--- |
| **Left Click** | **Add Spot** | Creates a new parking space at the cursor location. |
| **Right Click** | **Remove Spot** | Deletes an existing parking space if clicked inside its area. |
| **ESC / Close** | **Exit** | Closes the tool. Changes are saved automatically. |

### 🧠 Key Logic: Automatic Sorting

One of the main challenges in manual labeling is that users click spots in a random order. To solve this, the script includes a **Clustering & Sorting Algorithm**:

1.  **Clustering:** It groups parking spots into vertical columns based on their X-coordinates (using a proximity threshold).
2.  **Sorting:**
    * Columns are sorted from Left to Right.
    * Spots within each column are sorted from Top to Bottom.
3.  **Result:** This ensures that Parking Spot IDs (1, 2, 3...) are always sequential and logical, regardless of the order in which they were drawn.

### ⚙️ Technical Details

* **Fixed Dimensions:** The script assumes a fixed camera angle. Default spot size is set to `width=107`, `height=48` pixels.
* **Data Persistence:** Coordinates are serialized and saved to a pickle file (`CarParkPos`), ensuring the configuration persists between sessions.

### 📸 Screenshot
![Picker Interface](app/screenshots/picker_tool.png)
*(The interface showing defined parking spots with their generated IDs)*