import React from "react";
import "./Extension.css";

function Extension() {
  // 버튼 클릭 시 새 탭에서 현재 페이지 DeepThink 분석
  const goToService = () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const url = encodeURIComponent(tabs[0].url);
      window.open(`https://<your-client-url>/?auto_url=${url}`, '_blank');
    });
  };

  return (
    <div className="deepthink-ext-popup">
      <div className="deepthink-ext-title">DeepThink</div>
      <div className="deepthink-ext-desc">
        현재 보고 있는 웹페이지를<br />
        <span className="deepthink-ext-highlight">AI로 즉시 분석</span>해보세요!
      </div>
      <button
        onClick={goToService}
        className="deepthink-ext-btn"
      >
        이 페이지 분석하기
      </button>
      <div className="deepthink-ext-footer">
        <span>Powered by DeepThink</span>
      </div>
    </div>
  );
}

export default Extension;
