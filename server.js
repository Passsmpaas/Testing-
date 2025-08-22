async function fetchSubjects() {
    const selectedCourse = document.getElementById('batchSelect').value;
    if (!selectedCourse) return;

    const ins = document.getElementById('ins').value.trim();
    const userid = document.getElementById('userid').value.trim();
    const token = document.getElementById('token').value.trim();

    if (!ins || !userid || !token) {
        alert("Please enter Institute, User ID, and Token!");
        return;
    }

    try {
        const res = await fetch('/api/subjects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                ins: ins,
                userid: userid,
                token: token,
                courseid: selectedCourse
            })
        });

        const subjects = await res.json();

        if (subjects.error) {
            alert("Error fetching subjects: " + subjects.error);
            return;
        }

        const subjectSelect = document.getElementById('subjectSelect');
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.subjectid;
            opt.text = s.subject_name || s.subjectid;
            subjectSelect.appendChild(opt);
        });

        document.getElementById('topicSelect').innerHTML = '<option value="">Select Topic</option>';
        document.getElementById('qualitySelect').innerHTML = '<option value="">Select Quality</option>';

    } catch (err) {
        console.error("❌ Error fetching subjects:", err);
        alert("Failed to fetch subjects. Check console for details.");
    }
                         }
