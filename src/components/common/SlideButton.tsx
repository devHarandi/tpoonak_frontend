// components/SlideButton.tsx
import { Button ,Box} from "@mui/material";
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import styles from "./styles/SlideButton.module.css";

interface SlideButtonProps {
  text: string;
  onClick?: () => void;
}

const SlideButton: React.FC<SlideButtonProps> = ({ text, onClick }) => {
  return (
    <Box sx={{ mx: 2.5 }}>
        <div className={styles.container}>
        <div className={styles.button} onClick={onClick}>
            {text}
        </div>
        <ArrowBackIos className={styles.icon} />
        </div>
    </Box>
  );
};

export default SlideButton;