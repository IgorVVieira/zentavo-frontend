import Box from '@mui/material/Box';

interface CoinLogoProps {
  size?: number;
}

export default function CoinLogo({ size = 24 }: CoinLogoProps) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#1976d2',
        color: '#fff',
        fontSize: size * 0.55,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      $
    </Box>
  );
}
