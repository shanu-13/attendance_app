// Frontend JavaScript code for handling clock in/out buttons

// Function to update button visibility based on attendance status
async function updateAttendanceButtons() {
    try {
        const response = await fetch('/api/attendance/status/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // or however you store your auth token
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Attendance Status:', data); // Debug log
        
        const clockInBtn = document.getElementById('clockInBtn');
        const clockOutBtn = document.getElementById('clockOutBtn');
        
        if (data.is_clocked_in) {
            // User is clocked in - show clock out button
            clockInBtn.style.display = 'none';
            clockOutBtn.style.display = 'block';
            
            // Optional: Show current session info
            if (data.active_session) {
                document.getElementById('currentSession').innerHTML = 
                    `Clocked in at: ${new Date(data.active_session.clock_in).toLocaleTimeString()}`;
            }
        } else {
            // User is not clocked in - show clock in button
            clockInBtn.style.display = 'block';
            clockOutBtn.style.display = 'none';
            document.getElementById('currentSession').innerHTML = '';
        }
        
    } catch (error) {
        console.error('Error fetching attendance status:', error);
    }
}

// Clock In function
async function clockIn() {
    try {
        const response = await fetch('/api/attendance/clock-in/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Clocked in successfully!');
            // Update buttons after successful clock in
            updateAttendanceButtons();
        } else {
            alert('Clock in failed: ' + data.error);
        }
        
    } catch (error) {
        console.error('Clock in error:', error);
        alert('Clock in failed: ' + error.message);
    }
}

// Clock Out function
async function clockOut() {
    try {
        const response = await fetch('/api/attendance/clock-out/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Clocked out successfully! Total hours: ${data.total_hours}`);
            // Update buttons after successful clock out
            updateAttendanceButtons();
        } else {
            alert('Clock out failed: ' + data.error);
        }
        
    } catch (error) {
        console.error('Clock out error:', error);
        alert('Clock out failed: ' + error.message);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Update buttons on page load
    updateAttendanceButtons();
    
    // Add event listeners to buttons
    document.getElementById('clockInBtn').addEventListener('click', clockIn);
    document.getElementById('clockOutBtn').addEventListener('click', clockOut);
});

// Optional: Update status every 30 seconds
setInterval(updateAttendanceButtons, 30000);