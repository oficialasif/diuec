## Issues & Required Modifications

### 1. Team Join Form Issue
- Remove the **DIU ID** field from the team join form.
- Add the following fields:
  - **Name**
  - **Gmail**
  - **Game Username**
- Remove the **Device Type** field and add **Device Name** instead.
- Keep all other existing fields unchanged.
- The **team captain must be able to view full teammate details** after members join the team.

---

### 2. Team Join Request Status
- When a user submits a request to join a team, the request is still shown as active.
- The join request status should be updated to **Pending** until it is approved or rejected by the team captain.

---

### 3. Tournament Registration Limit Issue
- If a tournament has a limited number of teams (e.g., **2 teams**), the **Register Now** button remains visible even after the limit is reached.
- Once the maximum number of teams has registered, the button should be replaced with **Team is Full**.

---

### 4. Payment Clearance History (Admin Panel)
- In **Admin Panel → Payment Clearance**, add a **History** column.
- This column should display the **payment clearance history** for each transaction.

---

### 5. Tournament Editing Limitations (Admin Panel)
- In **Admin Panel → Tournaments**, the tournament edit option does not allow editing of the following fields:
  - Tournament Type
  - Format
  - Maximum Teams
  - Prize Pool
  - Entry Fee
  - Other relevant tournament fields
- This feature is **critical** to:
  - Increase team limits
  - Extend registration time
  - Modify tournament details after creation

---

### 6. Leaderboard Display Issue
- Clicking on **1st, 2nd, and 3rd positions** should **not display team member details**.
- From **4th position onward**:
  - Team member details should be visible.
  - Currently, member names are not shown and only **Member** is displayed.
  - This needs to be fixed to show **actual team member names**.

### 7. Custom Mouse issue
- sometimes custom mouse cursor not visible