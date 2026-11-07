// A square perspective floor, scaled uniformly when used outside the 260px model.
export function gridFloor(size=260) {
  const s=size/260, horizon=98;
  return [
    ...[0,40,80,112,148,180,220,260].map(x=>[[130+(x-130)*.2,horizon],[x,260]]),
    ...[104,119,143,181,238].map(y=>[[0,y],[260,y]]),
  ].map(line=>line.map(([x,y])=>[x*s,y*s]));
}
