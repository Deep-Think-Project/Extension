(function () {
    // 버튼 중복 생성 방지
    if (document.getElementById('deepthink-button')) return;
  
    // 버튼 생성
    const button = document.createElement('button');
    button.id = 'deepthink-button';
    
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('assets/icon.png');
    img.style.width = '20px';
    img.style.height = '20px';
    button.appendChild(img);
    
    // 버튼 스타일
    Object.assign(button.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '6px',
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    });



      button.onclick = async () => {
        // article 태그
        const articleEl = document.querySelector('article');
        
        if (!articleEl) {
          alert('이 페이지에서는 <article> 태그를 찾지 못했습니다!');
          return;
        }
        
        // const htmlSource = articleEl.innerText;
        const url = window.location.href;
        try {
          
          const response = await fetch('https://<your-server-url>', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: url })
          });
      
          if (!response.ok) throw new Error('서버 에러');
      
          const data = await response.json();
          console.log(data);
      
          // summary/author_intent 영역 표시
          if (data.results && data.results.summary && data.results.author_intent) {
            const summaryArr = data.results.summary;
            const authorIntentArr = data.results.author_intent;
      
            // summary, authorIntent 리스트 렌더링
            const summaryHTML = `<ul style="
              list-style-type: disc;
              padding-left: 20px;
              margin: 7px 0 0 0;
              font-size:1.01rem;
            ">${summaryArr.map(item => `<li style="margin-bottom:3px;">${item}</li>`).join('')}</ul>`;
      
            const authorIntentHTML = `<ul style="
              list-style-type: disc;
              padding-left: 20px;
              margin: 7px 0 0 0;
              font-size:1rem;
            ">${authorIntentArr.map(item => `<li style="margin-bottom:3px;">${item}</li>`).join('')}</ul>`;
      
            // 이전 summary가 있으면 제거
            const prevSummary = document.getElementById('deepthink-summary-container');
            if (prevSummary) prevSummary.remove();
      
            const infoDiv = document.createElement('div');
            infoDiv.id = 'deepthink-summary-container';
            infoDiv.style = `
              background: linear-gradient(#f2f6ff, #f2f6ff) padding-box,
              linear-gradient(to right, #82218c, #0603b2) border-box;
              border: 1.5px solid transparent;
              border-radius: 10px;
              margin-bottom: 18px;
              padding: 18px 22px;
              box-shadow: 0 3px 14px rgba(98,112,187,.11);
              font-family: inherit;
              color: #1d2542;
            `;
  
            infoDiv.innerHTML = `
              <div style="
                display:inline-block;  /* 또는 block */
                font-size:1.16rem;
                font-weight:700;
                margin-bottom:10px;
                color:transparent;
                background:linear-gradient(to right, #82218c,#0603b2);
                background-clip:text;
                -webkit-background-clip:text;
                -webkit-text-fill-color:transparent;
              ">
                DeepThink Analysis
              </div>
              <div style="margin-bottom:9px;">
                <span style="font-weight:600;">요약:</span>
                ${summaryHTML}
              </div>
              <div>
                <span style="font-weight:600;">작성자 의도:</span>
                ${authorIntentHTML}
              </div>
            `;
            articleEl.parentNode.insertBefore(infoDiv, articleEl);
          }
      
          // === 문장 하이라이팅 처리 ===
          if (data.sentences && Array.isArray(data.sentences)) {
            highlightAllSentencesByIndex(articleEl, data.sentences);
          }
        } catch (err) {
          alert('서버 전송 실패: ' + err.message);
        }
      };
      
      // ========= highlightAllSentences =========
      function highlightAllSentencesByIndex(articleEl, sentences) {
        // 모든 텍스트 파싱
        const nodes = [];
        // 모든 노드 쪼갬
        articleEl.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            // 문장 단위로 쪼갬
            splitSentences(node.data).forEach(sent => {
              nodes.push(document.createTextNode(sent));
            });
          } else {
            // element 노드는 재귀
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 하위 노드도 문장별로 쪼개야 한다면, 재귀로 처리 가능
              nodes.push(node.cloneNode(true));
            }
          }
        });
      
        // 문장별로 span 래핑(서버 sentences와 매칭)
        const result = [];
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (
            node.nodeType === Node.TEXT_NODE &&
            node.data.trim() !== ""
          ) {
            // 문장별로 trim 매칭
            const match = sentences.find(s => s.sentence.trim() === node.data.trim());
            if (match) {
              const span = document.createElement('span');
              span.className = `deepthink-hl deepthink-${match.type}`;
              span.textContent = match.sentence;
              span.dataset.index = match.index;
              span.style.cursor = 'pointer';
      
              span.addEventListener('click', function (e) {
                e.stopPropagation();
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
      
        // CSS
        if (!document.getElementById('deepthink-hl-style')) {
          const style = document.createElement('style');
          style.id = 'deepthink-hl-style';
          style.innerHTML = `
            .deepthink-hl { padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: box-shadow 0.15s; }
            .deepthink-clear_sentence { background:#a7f49b; }
            .deepthink-ambiguous_sentence { background: #ddb2ff; }
            .deepthink-hl:active, .deepthink-hl.selected { box-shadow: 0 0 0 2px #2a4de466; }
            .deepthink-infobox {
              display: inline-block;
              margin-left: 12px;
              /* Gradient border trick */
              background: linear-gradient(#f9fcff, #f9fcff) padding-box,
                          linear-gradient(to right, #82218c, #0603b2) border-box;
              border: 1.5px solid transparent;
              border-radius: 8px;
              box-shadow: 0 4px 14px rgba(75,127,220,0.11);
              padding: 13px 16px 11px 14px;
              color: #1c2642;
              font-size: 0.99rem;
              min-width: 220px;
              max-width: 360px;
              vertical-align: middle;
              z-index: 99999;
              position: relative;
            }
            .deepthink-infobox .ref-list {
              padding-left: 18px;
              margin-top: 7px;
              margin-bottom: 0;
              font-size: 0.95rem;
            }
            .deepthink-infobox .ref-list li {
              margin-bottom: 2px;
              color: #425ba3;
              word-break: break-all;
            }
            .deepthink-infobox .infobox-label {
              font-weight: 700;
              margin-right: 3px;
              color: transparent;
              background: linear-gradient(to right, #82218c, #0603b2);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .deepthink-infobox .other-interpret {
              margin-top: 4px;
              color: #245184;
            }
          `;
          document.head.appendChild(style);
        }
        
      }
      
      // infoBox 생성 함수에서 문장별 reason/other_interpretations/references 출력
    function showSentenceInfoBox(span, sentenceObj) {
        // 기존 infoBox 모두 제거
        document.querySelectorAll('.deepthink-infobox').forEach(box => box.remove());
    
        // 부모(article)를 relative로 (한 번만)
        const article = span.closest('article');
        if (article.style.position !== 'relative') article.style.position = 'relative';

        const box = document.createElement('div');
        box.className = 'deepthink-infobox';

        // 정확한 위치 계산!
        const rect = span.getBoundingClientRect();
        box.style.position = 'fixed';
        box.style.left = `${rect.right + 12}px`;
        box.style.top = `${rect.top - 4}px`;
        
        let html = '';
    
        // === 문장별 reason ===
        if (sentenceObj.reason) {
        html += `<div>
            <span class="infobox-label">이유:</span>
            <span>${sentenceObj.reason}</span>
        </div>`;
        }
    
        // === 문장별 other_interpretations ===
        if (sentenceObj.other_interpretations && sentenceObj.other_interpretations.length) {
        html += `
            <div class="other-interpret">
            <span class="infobox-label">다른 해석:</span>
            <ul style="list-style-type: disc; margin:3px 0 0 0; padding-left:18px;">
                ${sentenceObj.other_interpretations.map(str => `<li>${str}</li>`).join('')}
            </ul>
            </div>
        `;
        }
    
        // === 문장별 references ===
        if (sentenceObj.references && sentenceObj.references.length) {
            html += `
              <div style="margin-top:4px;">
                <span class="infobox-label">참고 자료:</span>
                <ul class="ref-list" style="list-style-type: none; margin: 4px 0 0 0; padding-left: 4px;">
                  ${
                    sentenceObj.references.map(ref =>
                      `<li style="margin-bottom:2px;">
                        <a href="${ref.url}" target="_blank" style="text-decoration:underline; color:#2354ba; display:inline-flex; align-items:center;">
                          <span style="font-size:1rem; margin-right:4px;">🔗</span>
                          ${ref.source_title || ref.url}
                        </a>
                      </li>`
                    ).join('')
                  }
                </ul>
              </div>
            `;
          }
    
        box.innerHTML = html || '<span style="color:#aaa;">추가정보 없음</span>';
        span.parentNode.insertBefore(box, span.nextSibling);
    
        article.appendChild(box);

        // 외부 클릭 시 infoBox 닫기
        setTimeout(() => {
        document.addEventListener('click', hideAllInfoBoxes, { once: true });
        }, 10);
    }
      
      function hideAllInfoBoxes() {
        document.querySelectorAll('.deepthink-infobox').forEach(box => box.remove());
      }

      function splitSentences(text) {
        return text.match(/[^.]+\.|[^.]+$/g) || [];
      }

    document.body.appendChild(button);
  })();
  