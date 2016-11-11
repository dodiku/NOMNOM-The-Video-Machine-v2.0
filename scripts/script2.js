var part = new Tone.Part(
	function(time, note){synth.triggerAttackRelease(note, "8n", time);},
	[[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]
).start(0);
// comment
