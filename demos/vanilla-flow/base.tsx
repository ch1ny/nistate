import { Button } from 'antd';
import { Flow } from 'nistate/classes';
import { shallowEqual } from 'nistate/common';
import React, { useEffect, useState } from 'react';

export default function () {
  const [total, setTotal] = useState(0);
  const [flow] = useState(
    () =>
      new Flow({
        count: total,
        base: 1,
      }),
  );
  useEffect(() => {
    flow.subscribe(
      ({ count, base }) => count + base,
      (total) => {
        setTotal(total);
      },
      shallowEqual,
      {
        instant: true,
      },
    );
  }, []);

  return (
    <div>
      <div>
        <span>count + base = {total}</span>
      </div>
      <div>
        <Button
          onClick={() => {
            flow.setState(({ count }) => ({ count: count + 1 }));
          }}
          type="primary"
        >
          COUNT + 1
        </Button>
      </div>
    </div>
  );
}
