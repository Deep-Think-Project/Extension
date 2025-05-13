import "./content.css";

(function () {
  // 1. 버튼 중복 생성 방지
  if (document.getElementById("deepthink-button")) return;

  // 2. 버튼 생성
  const button = document.createElement("button");
  button.id = "deepthink-button";
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("assets/icon.png");
  button.appendChild(img);

  button.onclick = async () => {
    const articleEl = document.querySelector("article");
    if (!articleEl) {
      alert("이 페이지에서는 <article> 태그를 찾지 못했습니다");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/extension_app/naver_news/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: articleEl.outerHTML }),
        }
      );

      if (!response.ok) throw new Error("서버 에러");

      /*
      서버 응답 구조 예시:
      {
          article_html: "<article>...<span class='deepthink-hl' data-reason='...' ...>문장</span>...</article>",
          summary: [...],
          author_intent: [...]
      }
      */
      const data = await response.json();
      // 3. 요약/의도 컨테이너 중복 생성 방지
      const prevSummary = document.getElementById(
        "deepthink-analysis-container"
      );
      if (prevSummary) {
        prevSummary.remove();
      }

      // 4. article 위에 요약, 의도 리스트 렌더링
      const summaryHTML = `<ul class="deepthink-list deepthink-summary-list">
              ${(data.summary || []).map((item) => `<li>${item}</li>`).join("")}
          </ul>`;

      const authorIntentHTML = `<ul class="deepthink-list deepthink-author-intent-list">
              ${(data.author_intent || [])
                .map((item) => `<li>${item}</li>`)
                .join("")}
          </ul>`;

      const infoDiv = document.createElement("div");
      infoDiv.id = "deepthink-analysis-container";
      infoDiv.innerHTML = `
          <div class="deepthink-title">DeepThink Analysis</div>
          <div style="margin-bottom:9px">
              <span class="deepthink-section-label">요약:</span>
              ${summaryHTML}
          </div>
          <div style="margin-bottom:9px">
              <span class="deepthink-section-label">작성자 의도:</span>
              ${authorIntentHTML}
          </div>
      `;
      articleEl.parentNode.insertBefore(infoDiv, articleEl);

      // 5. article 태그를 서버에서 돌려받은 HTML로 교체
      articleEl.outerHTML = data.article_html;

      const newArticleEl = document.querySelector("article");

      // 6. 하이라이트 클릭 시 infoBox 표시
      if (newArticleEl) {
        newArticleEl.addEventListener("click", function (e) {
          const target = e.target.closest(".deepthink-hl");
          if (target) {
            // 이미 선택된 요소를 다시 클릭한 경우에도 인포박스 유지
            // 다른 하이라이트 클릭 시에만 이전 인포박스 제거하고 새 인포박스 표시
            const currentSelected = document.querySelector(
              ".deepthink-hl.selected"
            );

            // 다른 하이라이트를 클릭한 경우에만 hideAllInfoBoxes 호출
            if (currentSelected && currentSelected !== target) {
              hideAllInfoBoxes();
            }

            showSentenceInfoBox(target);

            e.stopPropagation();
          }
        });
      }
    } catch (err) {
      alert("서버 전송 실패: " + err.message);
    }
  };

  function showSentenceInfoBox(span) {
    hideAllInfoBoxes();

    const article = span.closest("article");
    if (article && article.style.position !== "relative") {
      article.style.position = "relative";
    }

    const box = document.createElement("div");
    box.className = "deepthink-infobox";

    const rect = span.getBoundingClientRect();
    box.style.position = "fixed";
    box.style.left = `${rect.right + 12}px`;
    box.style.top = `${rect.top - 4}px`;

    let html = "";
    if (span.dataset.reason) {
      html += `
              <div class="reason-section">
                  <span class="infobox-label">이유:</span>
                  <span>${span.dataset.reason}</span>
              </div>`;
    }
    if (span.dataset.other_interp) {
      const arr = span.dataset.other_interp.split("||").filter(Boolean);
      if (arr.length) {
        html += `
                  <div class="other-interpret-section">
                      <span class="infobox-label">다른 해석:</span>
                      <ul class="other-interpret-list">
                          ${arr.map((str) => `<li>${str}</li>`).join("")}
                      </ul>
                  </div>
              `;
      }
    }
    if (span.dataset.references) {
      let refs = [];
      try {
        refs = JSON.parse(span.dataset.references);
      } catch {}
      if (Array.isArray(refs) && refs.length) {
        html += `
                  <div class="ref-section">
                      <span class="infobox-label">참고 자료:</span>
                      <ul class="ref-list">
                          ${refs
                            .map(
                              (ref) => `<li>
                                      <a href="${ref.url}" target="_blank">
                                          <span class="ref-link-icon">🔗</span>
                                          ${ref.source_title || ref.url}
                                      </a>
                                  </li>`
                            )
                            .join("")}
                      </ul>
                  </div>
              `;
      }
    }
    box.innerHTML =
      html || '<span class="deepthink-infobox-no-info">추가 정보 없음</span>';

    document.body.appendChild(box);

    // 외부 클릭 시 infobox 닫기
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClickForInfoBox, {
        once: true,
      });
    }, 10);

    // 하이라이트 selected 표시
    document
      .querySelectorAll(".deepthink-hl.selected")
      .forEach((el) => el.classList.remove("selected"));
    span.classList.add("selected");
  }

  function handleOutsideClickForInfoBox(event) {
    if (
      !event.target.closest(".deepthink-infobox") &&
      !event.target.closest(".deepthink-hl")
    ) {
      hideAllInfoBoxes();
    } else {
      setTimeout(() => {
        document.addEventListener("click", handleOutsideClickForInfoBox, {
          once: true,
        });
      }, 10);
    }
  }

  function hideAllInfoBoxes() {
    document
      .querySelectorAll(".deepthink-infobox")
      .forEach((box) => box.remove());
    document
      .querySelectorAll(".deepthink-hl.selected")
      .forEach((el) => el.classList.remove("selected"));
  }

  document.body.appendChild(button);
})();
