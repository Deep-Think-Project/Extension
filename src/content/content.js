// content.js
(function () {
  // 버튼 중복 생성 방지
  if (document.getElementById('deepthink-button')) return;

  // 버튼 생성
  const button = document.createElement('button');
  button.id = 'deepthink-button'; 
  
  const img = document.createElement('img');
  img.src = chrome.runtime.getURL('assets/icon.png');
  button.appendChild(img);

  button.onclick = async () => {
      const articleEl = document.querySelector('article');
      
      if (!articleEl) {
        alert('이 페이지에서는 <article> 태그를 찾지 못했습니다!');
        return;
      }
      const url = window.location.href;
      try {
        const response = await fetch('https://<your-server-url>', { // 실제 서버 URL로 변경하세요
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: url })
        });
    
        if (!response.ok) throw new Error('서버 에러');
    
        const data = await response.json();
        console.log(data);
    
        if (data.results && data.results.summary && data.results.author_intent) {
          const summaryArr = data.results.summary;
          const authorIntentArr = data.results.author_intent;
    
          // summary, authorIntent 리스트 렌더링
          const summaryHTML = `<ul class="deepthink-list deepthink-summary-list">
              ${summaryArr.map(item => `<li>${item}</li>`).join('')}
          </ul>`;
    
          const authorIntentHTML = `<ul class="deepthink-list deepthink-author-intent-list">
              ${authorIntentArr.map(item => `<li>${item}</li>`).join('')}
          </ul>`;
    
          const prevSummary = document.getElementById('deepthink-summary-container');
          if (prevSummary) prevSummary.remove();
    
          const infoDiv = document.createElement('div');
          infoDiv.id = 'deepthink-summary-container'; 

          infoDiv.innerHTML = `
            <div class="deepthink-title">
              DeepThink Analysis
            </div>
            <div style="margin-bottom:9px;">
              <span class="deepthink-section-label">요약:</span>
              ${summaryHTML}
            </div>
            <div>
              <span class="deepthink-section-label">작성자 의도:</span>
              ${authorIntentHTML}
            </div>
          `;
          articleEl.parentNode.insertBefore(infoDiv, articleEl);
        }
    
        if (data.sentences && Array.isArray(data.sentences)) {
          highlightAllSentencesByIndex(articleEl, data.sentences);
        }
      } catch (err) {
        alert('서버 전송 실패: ' + err.message);
      }
    };
    
  function highlightAllSentencesByIndex(articleEl, sentences) {
      const nodes = [];
      articleEl.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          splitSentences(node.data).forEach(sent => {
            nodes.push(document.createTextNode(sent));
          });
        } else {
          if (node.nodeType === Node.ELEMENT_NODE) {
            nodes.push(node.cloneNode(true));
          }
        }
      });
    
      const result = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (
          node.nodeType === Node.TEXT_NODE &&
          node.data.trim() !== ""
        ) {
          const match = sentences.find(s => s.sentence.trim() === node.data.trim());
          if (match) {
            const span = document.createElement('span');
            span.className = `deepthink-hl deepthink-${match.type}`; 
            span.textContent = match.sentence;
            span.dataset.index = match.index;
    
            span.addEventListener('click', function (e) {
              e.stopPropagation();
              // 기존에 선택된 하이라이트의 selected 클래스 제거 
              document.querySelectorAll('.deepthink-hl.selected').forEach(el => el.classList.remove('selected'));
              // 현재 클릭된 하이라이트에 selected 클래스 추가 
              this.classList.add('selected');

              const idx = parseInt(this.dataset.index, 10);
              const sentenceObj = sentences.find(s => s.index === idx);
              if (sentenceObj) showSentenceInfoBox(span, sentenceObj);
            });
    
            result.push(span);
          } else {
            result.push(node);
          }
        } else {
          result.push(node);
        }
      }
    
      articleEl.innerHTML = "";
      result.forEach(n => articleEl.appendChild(n));
  }
    
  function showSentenceInfoBox(span, sentenceObj) {
      hideAllInfoBoxes();
  
      const article = span.closest('article');
      if (article && article.style.position !== 'relative') { // article이 존재할 때만 스타일 변경
           article.style.position = 'relative'; // 이 부분은 동적이라 js에 남김
      }

      const box = document.createElement('div');
      box.className = 'deepthink-infobox'; 
      
      // 위치 계산은 동적이므로 js에 남김
      const rect = span.getBoundingClientRect();
      box.style.position = 'fixed'; // 인라인 스타일로 적용
      box.style.left = `${rect.right + window.scrollX + 12}px`; // 스크롤 위치 고려
      box.style.top = `${rect.top + window.scrollY - 4}px`;    // 스크롤 위치 고려
      
      let html = '';
  
      if (sentenceObj.reason) {
      html += `<div>
          <span class="infobox-label">이유:</span>
          <span>${sentenceObj.reason}</span>
      </div>`;
      }
  
      if (sentenceObj.other_interpretations && sentenceObj.other_interpretations.length) {
      html += `
          <div class="deepthink-other-interpret">
          <span class="infobox-label">다른 해석:</span>
          <ul class="deepthink-other-interpret-list">
              ${sentenceObj.other_interpretations.map(str => `<li>${str}</li>`).join('')}
          </ul>
          </div>
      `;
      }
  
      if (sentenceObj.references && sentenceObj.references.length) {
          html += `
            <div class="deepthink-ref-section">
              <span class="infobox-label">참고 자료:</span>
              <ul class="ref-list">
                ${
                  sentenceObj.references.map(ref =>
                    `<li>
                      <a href="${ref.url}" target="_blank">
                        <span class="ref-link-icon">🔗</span>
                        ${ref.source_title || ref.url}
                      </a>
                    </li>`
                  ).join('')
                }
              </ul>
            </div>
          `;
        }
  
      box.innerHTML = html || '<span class="deepthink-infobox-no-info">추가정보 없음</span>';
      
      // span 다음에 삽입하는 대신, body나 특정 고정된 컨테이너에 추가하는 것을 고려할 수 있습니다.
      // article에 추가하면 article 스크롤 시 따라다닐 수 있지만, fixed position이므로 화면 기준입니다.
      document.body.appendChild(box); // body에 직접 추가하여 다른 요소의 position에 영향받지 않도록 함

      // 외부 클릭 시 infoBox 닫기
      setTimeout(() => {
          document.addEventListener('click', handleOutsideClickForInfoBox, { once: true });
      }, 10);
  }

  function handleOutsideClickForInfoBox(event) {
      // 클릭된 요소가 infobox 내부가 아닐 때만 닫습니다.
      if (!event.target.closest('.deepthink-infobox')) {
          hideAllInfoBoxes();
      } else {
          // infobox 내부를 클릭했다면, 다시 이벤트 리스너를 등록하여 다음 외부 클릭을 감지합니다.
          // (infobox 내부의 링크 클릭 등 상호작용을 위해)
          setTimeout(() => {
              document.addEventListener('click', handleOutsideClickForInfoBox, { once: true });
          }, 10);
      }
  }
    
  function hideAllInfoBoxes() {
      document.querySelectorAll('.deepthink-infobox').forEach(box => box.remove());
      document.querySelectorAll('.deepthink-hl.selected').forEach(el => el.classList.remove('selected')); // 선택 해제
  }

  function splitSentences(text) {
      // 마침표(.), 물음표(?), 느낌표(!)를 기준으로 문장을 나누되, 해당 구두점도 포함합니다.
      // 공백만 있는 문자열이 생성되는 것을 방지하기 위해 filter(s => s.trim() !== "") 추가
      return text.match(/[^.!?]+[.!?]?/g)?.filter(s => s.trim() !== "") || [];
  }

  document.body.appendChild(button);
})();
