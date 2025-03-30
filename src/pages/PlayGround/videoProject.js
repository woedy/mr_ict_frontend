class CodeSnippet {
    constructor(id, code, language, startTime, endTime) {
      this.id = id;
      this.code = code;
      this.language = language;
      this.startTime = startTime;
      this.endTime = endTime;
      this.visible = true;
    }
  }
  
  class VideoProject {
    constructor(id, title) {
      this.id = id;
      this.title = title;
      this.videoFile = null;
      this.duration = 0;
      this.clips = []; // Video clips
      this.codeSnippets = []; // Code snippets synchronized with video
      this.editHistory = []; // For undo/redo
    }
    
    // Add a new code snippet at the current time
    addCodeSnippet(code, language, startTime, endTime) {
      const id = `snippet-${Date.now()}`;
      const snippet = new CodeSnippet(id, code, language, startTime, endTime);
      this.codeSnippets.push(snippet);
      return snippet;
    }
    
    // Updates timestamps of all code snippets after an edit operation
    updateCodeSnippetsAfterEdit(editOperation) {
      const { type, cutStart, cutEnd } = editOperation;
      
      if (type === 'cut' || type === 'delete') {
        const cutDuration = cutEnd - cutStart;
        
        this.codeSnippets.forEach(snippet => {
          // Case 1: Snippet is entirely before the cut - no change needed
          if (snippet.endTime <= cutStart) {
            return;
          }
          
          // Case 2: Snippet is entirely after the cut - shift backward
          if (snippet.startTime >= cutEnd) {
            snippet.startTime -= cutDuration;
            snippet.endTime -= cutDuration;
            return;
          }
          
          // Case 3: Snippet overlaps with the cut
          if (snippet.startTime < cutStart && snippet.endTime > cutEnd) {
            // Snippet spans the entire cut - shrink it
            snippet.endTime -= cutDuration;
            return;
          }
          
          // Case 4: Snippet starts before cut but ends within cut
          if (snippet.startTime < cutStart && snippet.endTime <= cutEnd) {
            // Truncate snippet to end at cut start
            snippet.endTime = cutStart;
            return;
          }
          
          // Case 5: Snippet starts within cut and ends after cut
          if (snippet.startTime >= cutStart && snippet.startTime < cutEnd && snippet.endTime > cutEnd) {
            // Move start to cut start and adjust duration
            const originalDuration = snippet.endTime - snippet.startTime;
            snippet.startTime = cutStart;
            snippet.endTime = cutStart + (originalDuration - (cutEnd - snippet.startTime));
            return;
          }
          
          // Case 6: Snippet is entirely within the cut - mark as removed
          if (snippet.startTime >= cutStart && snippet.endTime <= cutEnd) {
            snippet.visible = false;
            return;
          }
        });
        
        // Filter out snippets that were marked as not visible
        this.codeSnippets = this.codeSnippets.filter(snippet => snippet.visible);
      }
    }
  }
  
  export { VideoProject, CodeSnippet };