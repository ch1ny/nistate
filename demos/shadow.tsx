import { Button, Space } from 'antd';
import { shadow } from 'nistate/common';
import React, { useState } from 'react';

const baseObj = {
  count: 0,
};

export default function () {
  const [[proxy, setData]] = useState(() => shadow(baseObj));
  const [_, setRenderCache] = useState({});

  return (
    <div>
      <div>
        <span style={{ fontWeight: 600 }}>count：</span>
        <span>{proxy.count}</span>
      </div>
      <div>
        <Space>
          <Button
            onClick={() => {
              proxy.count += 1;
              console.log(baseObj, proxy);
              setRenderCache({}); // 触发重新渲染
            }}
          >
            直接赋值 +1
          </Button>
          <Button
            onClick={() => {
              setData('count', proxy.count + 1);
              console.log(baseObj, proxy);
              setRenderCache({}); // 触发重新渲染
            }}
            type="primary"
          >
            通过 setData 赋值 +1
          </Button>
        </Space>
      </div>
    </div>
  );
}
