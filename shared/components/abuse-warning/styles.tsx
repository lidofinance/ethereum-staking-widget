import styled from 'styled-components';

export const AbuseWarningStyle = styled.div`
  margin: 20px 0 32px;
  background-color: rgba(255, 172, 47, 0.1);
  border-radius: 8px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 9px 20px;

  svg {
    overflow: visible;
  }
`;

export const AbuseText = styled.p`
  font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
  line-height: 18px;
  margin-left: 7px;
  color: #ffac2f;

  a {
    color: inherit;
  }

  a:hover {
    color: #ffac2f;
  }
`;
