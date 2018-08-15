const pickLoggedOutDesign = () => {
  const designs = [{
    cover: 'cover_001.jpg',
    bgcolor: 'white',
    fgcolor: 'black'
  }
    /*,
        {
          cover: 'cover_002.jpg',
          bgcolor: 'rgb(255, 45, 88)',
          fgcolor: 'white'
        },
        {
          cover: 'cover_003.jpg',
          bgcolor: 'rgb(94, 253, 87)',
          fgcolor: 'black'
        },
        {
          cover: 'cover_004.jpg',
          bgcolor: 'rgb(8, 60, 79)',
          fgcolor: 'white'
        },
        {
          cover: 'cover_005.jpg',
          bgcolor: 'rgb(4, 102, 223)',
          fgcolor: 'white'
        },
        {
          cover: 'cover_006.jpg',
          bgcolor: 'rgb(255, 244, 88)',
          fgcolor: 'black'
        },
        {
          cover: 'cover_007.jpg',
          bgcolor: 'rgb(242, 90, 50)',
          fgcolor: 'white'
        } */
  ]
  return designs[Math.floor(Math.random() * designs.length)]
}
exports.pickLoggedOutDesign = pickLoggedOutDesign
