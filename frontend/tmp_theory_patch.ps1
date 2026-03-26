$p = "C:\AD\work\My company\school\frontend\src\app\pages\TheoryPage.tsx"
$s = Get-Content -Raw $p
$s = $s.Replace("  const [isAbsenceDetailOpen, setIsAbsenceDetailOpen] = useState(false);`n", "  const [isAbsenceDetailOpen, setIsAbsenceDetailOpen] = useState(false);`n  const [attendanceRequestState, setAttendanceRequestState] = useState<'idle' | 'saving'>('idle');`n")
$s = $s.Replace("    setAttendanceData(initialData);`n    setIsAttendanceModalOpen(true);", "    setAttendanceData(initialData);`n    setAttendanceRequestState('idle');`n    setIsAttendanceModalOpen(true);")
$oldSubmit = @"
  const handleSubmitAttendance = () => {
    console.log('Submitting attendance:', attendanceData);
    setIsAttendanceModalOpen(false);
    setAttendanceData({});
  };
"@
$newSubmit = @"
  const handleSubmitAttendance = async () => {
    if (!selectedGroup || !attendanceLecture) return;

