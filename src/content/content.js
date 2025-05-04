(function () {
    if (document.getElementById('deepthink-button')) return;
  
    const button = document.createElement('button');
    button.innerText = 'DeepThink 분석';
    button.id = 'deepthink-button';
  
    Object.assign(button.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '10px 15px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    });
  
    button.onclick = () => {
      alert('페이지 분석 시작!');
    };
  
    document.body.appendChild(button);
  })();
  