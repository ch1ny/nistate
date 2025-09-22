import { Button, Space } from 'antd';
import { createProvider } from 'nistate';
import React, { memo } from 'react';

const [Provider, { useWatch, useSetter }] = createProvider(() => {
  return {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  };
});

let aRenderTimes = 0;
const RenderForA = memo(() => {
  const a = useWatch(({ a }) => a);
  aRenderTimes += 1;

  return (
    <div>
      <div>
        <span>A: </span>
        <span>{a}</span>
      </div>
      <div>组件 A 渲染次数：{aRenderTimes}</div>
    </div>
  );
});

let bRenderTimes = 0;
const RenderForB = memo(() => {
  const b = useWatch(({ b }) => b);
  bRenderTimes += 1;

  return (
    <div>
      <div>
        <span>B: </span>
        <span>{b}</span>
      </div>
      <div>组件 B 渲染次数：{bRenderTimes}</div>
    </div>
  );
});

let cRenderTimes = 0;
const RenderForC = memo(() => {
  const _ = useWatch(() => null);
  const setter = useSetter();

  cRenderTimes += 1;

  return (
    <div>
      <div>
        <Space>
          <Button
            onClick={() => {
              setter(({ a }) => ({ a: a + 1 }));
            }}
          >
            a + 1
          </Button>
          <Button
            onClick={() => {
              setter(({ b }) => ({ b: b + 1 }));
            }}
          >
            b + 1
          </Button>
        </Space>
      </div>
      <div>组件 C 渲染次数：{cRenderTimes}</div>
    </div>
  );
});

const Page = memo(() => {
  return (
    <div>
      <RenderForA />
      <RenderForB />
      <RenderForC />
    </div>
  );
});

export default function () {
  return (
    <Provider>
      <Page />
    </Provider>
  );
}
